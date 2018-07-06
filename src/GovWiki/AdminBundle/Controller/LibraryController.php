<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\FileLibraryBundle\Entity\AbstractFile;
use GovWiki\FileLibraryBundle\Entity\Directory;
use GovWiki\FileLibraryBundle\Entity\Document;
use GovWiki\FileLibraryBundle\Repository\FileRepository;
use GovWiki\FileLibraryBundle\Service\DocumentMover\DocumentMoverException;
use GovWiki\FileLibraryBundle\Service\DocumentMover\DocumentMoverService;
use GuzzleHttp\Psr7\Stream;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

/**
 * Class LibraryController
 *
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "/{environment}/library",
 *  requirements={
 *      "environment": "\w+"
 *  }
 * )
 */
class LibraryController extends AbstractGovWikiAdminController
{

    /**
     * @Configuration\Route("/{slug}", requirements={ "slug": "[\w-]*" }, defaults={ "slug": "" }, methods={ "GET" })
     * @Configuration\Template
     *
     * @param string      $environment Required environment name.
     * @param string|null $slug        A listed directory slug.
     *
     * @return array
     */
    public function indexAction(string $environment, string $slug = null): array
    {
        $user = $this->getUser();
        /** @var FileRepository $repository */
        $repository = $this->getDoctrine()->getRepository(AbstractFile::class);

        $topLevelDirNames = $repository->getTopLevelDirNames($environment);

        $file = null;
        if ($slug !== null) {
            $file = $repository->findBySlug($environment, $slug);
        }

        if (($file === null) || ($file instanceof Directory)) {
            return [
                'slug' => $slug,
                'user' => $user,
                'defaultOrder' => ($file !== null) && ($file->getParent() === null) ? 'desc' : 'asc',
                'file' => $file,
                'topLevelDirNames' => $topLevelDirNames,
            ];
        }

        throw $this->createNotFoundException();
    }


    /**
     * @Configuration\Route("/document/{slug}", requirements={ "slug": "[\w-]+" }, methods={ "DELETE" })
     *
     * @param string $slug A removed document slug.
     *
     * @return JsonResponse
     */
    public function removeAction(string $slug): JsonResponse
    {
        $environment = $this->getCurrentEnvironment();
        $factory = $this->get('govwiki_filelibrary.storage_factory');
        $storage = $factory->createStorage($environment);

        /** @var FileRepository $repository */
        $repository = $this->getDoctrine()->getRepository(AbstractFile::class);
        $document = $repository->findBySlug($environment->getName(), $slug);

        if (! $document instanceof Document) {
            return JsonResponse::create([ 'error' => 'Removed file not found' ], 404);
        }

        $storage->remove($document->getPublicPath());

        return JsonResponse::create(null, 204);
    }

    /**
     * @Configuration\Route(
     *     "/document/{slug}/move",
     *     requirements={ "slug": "[\w-]+" },
     *     methods={ "PUT" }
     * )
     *
     * @param Request $request A HTTP request.
     * @param string  $slug    A moved file slug.
     *
     * @return JsonResponse
     */
    public function moveAction(Request $request, string $slug): JsonResponse
    {
        $environment = $this->getCurrentEnvironment();
        $factory = $this->get('govwiki_filelibrary.storage_factory');
        $storage = $factory->createStorage($environment);

        /** @var FileRepository $repository */
        $repository = $this->getDoctrine()->getRepository(AbstractFile::class);
        $document = $repository->findBySlug($environment->getName(), $slug);

        if (! $document instanceof Document) {
            return JsonResponse::create([ 'error' => 'Moved file not found' ], 404);
        }

        $documentMover = new DocumentMoverService($storage);

        $newTopLevelDirId = $request->request->get('topLevelDir');
        if ($newTopLevelDirId === null) {
            return JsonResponse::create([ 'error' => '"topLevelDir" parameter is required' ]);
        }

        /** @var Directory|null $newTopLevelDir */
        $newTopLevelDir = $repository->findById($environment->getName(), $newTopLevelDirId);

        if (($newTopLevelDir === null) || ! $newTopLevelDir->isDirectory()) {
            return JsonResponse::create([ 'error' => 'Try to move document into unknown directory' ], 404);
        }

        try {
            $documentMover->move($document, $newTopLevelDir);
        } catch (DocumentMoverException $exception) {
            return JsonResponse::create([
                'error' => \sprintf(
                    'Can\'t move due to %s',
                    $exception->getMessage()
                ),
            ], 400);
        }

        return JsonResponse::create(null, 204);
    }

    /**
     * @Configuration\Route(
     *     "/document/{slug}/rename",
     *     requirements={ "slug": "[\w-]+" },
     *     methods={ "PUT" }
     * )
     *
     * @param Request $request A HTTP Request.
     * @param string  $slug    A renamed document slug.
     *
     * @return JsonResponse
     */
    public function renameAction(Request $request, string $slug): JsonResponse
    {
        $environment = $this->getCurrentEnvironment();
        $factory = $this->get('govwiki_filelibrary.storage_factory');
        $storage = $factory->createStorage($environment);

        /** @var FileRepository $repository */
        $repository = $this->getDoctrine()->getRepository(AbstractFile::class);
        $document = $repository->findBySlug($environment->getName(), $slug);

        if (! $document instanceof Document) {
            return JsonResponse::create([ 'error' => 'Moved file not found' ], 404);
        }

        $newName = $request->request->get('name');
        if ($newName === null) {
            return JsonResponse::create([ 'error' => '"name" parameter is required' ], 400);
        }

        /** @var DocumentMoverService $documentMover */
        $documentMover = new DocumentMoverService($storage);

        try {
            $documentMover->move($document, $document->getTopLevelDir(), $newName);
        } catch (DocumentMoverException $exception) {
            return JsonResponse::create([
                'error' => \sprintf(
                    'Can\'t move due to %s',
                    $exception->getMessage()
                ),
            ], 400);
        }

        return JsonResponse::create(null, 204);
    }

    /**
     * @Configuration\Route(
     *     "/directory/{slug}",
     *     requirements={ "slug": "[\w-]*" },
     *     defaults={ "slug": null },
     *     methods={ "POST" }
     * )
     *
     * @param Request $request A http request.
     * @param string  $slug    A target directory slug.
     *
     * @return JsonResponse
     */
    public function uploadAction(Request $request, string $slug = null): JsonResponse
    {
        $environment = $this->getCurrentEnvironment();
        $factory = $this->get('govwiki_filelibrary.storage_factory');
        $storage = $factory->createStorage($environment);

        /** @var FileRepository $repository */
        $repository = $this->getDoctrine()->getRepository(AbstractFile::class);
        $directory = null;

        if ($slug !== null) {
            $directory = $repository->findBySlug($environment->getName(), $slug);
        }

        if (! $directory instanceof Directory) {
            return JsonResponse::create([ 'error' => 'Directory not found' ], 404);
        }

        /** @var UploadedFile $file */
        $file = $request->files->get('file');
        if ($file === null) {
            return JsonResponse::create([
                'error' => 'File is not uploaded',
            ], 400);
        }

        $publicPath = '';
        if ($directory !== null) {
            $publicPath = $directory->getPublicPath();
        }

        $storage->createFile(
            $publicPath . '/'. $file->getClientOriginalName(),
            new Stream(fopen($file->getPathname(), 'rb'))
        );
        \unlink($file->getPathname());

        return JsonResponse::create(null, 204);
    }

    /**
     * @Configuration\Route(
     *     "/directory/{slug}",
     *     requirements={ "slug": "[\w-]*" },
     *     defaults={ "slug": null },
     *     methods={ "GET" }
     * )
     *
     * @param Request     $request A HTTP Request.
     * @param string|null $slug    A listed directory slug.
     *
     * @return JsonResponse
     */
    public function listAction(Request $request, string $slug = null): JsonResponse
    {
        $environment = $this->getCurrentEnvironment();
        $factory = $this->get('govwiki_filelibrary.storage_factory');
        $storage = $factory->createStorage($environment);

        /** @var FileRepository $repository */
        $repository = $this->getDoctrine()->getRepository(AbstractFile::class);
        $publicPath = '/';

        if ($slug !== null) {
            $directory = $repository->findBySlug($environment->getName(), $slug);

            if ($directory === null) {
                return JsonResponse::create([ 'error' => 'Directory not found' ], 404);
            }

            $publicPath = $directory->getPublicPath();
        }

        $search = $request->query->get('search', '');
        $order = $request->query->get('order');
        $limit = $request->query->getInt('limit', 100);
        $offset = $request->query->getInt('offset', 0);

        $directory = $storage->getDirectory($publicPath);
        if ($directory === null) {
            return JsonResponse::create([ 'error' => 'Directory not found' ], 404);
        }

        $listBuilder = $directory->getListBuilder()
            ->onlyDocuments($search !== '')
            ->recursive($search !== '')
            ->filterBy($search)
            ->showHidden($this->getUser() !== null)
            ->orderBy($order);

        if ($limit > 0) {
            $listBuilder
                ->setLimit($limit)
                ->setOffset($offset);
        }

        $count = \count($listBuilder);

        /** @var NormalizerInterface $normalizer */
        $normalizer = $this->get('serializer');

        return JsonResponse::create([
            'draw' => $request->query->get('draw'),
            'recordsTotal' => $count,
            'recordsFiltered' => $count,
            'data' => $normalizer->normalize(
                \iterator_to_array($listBuilder),
                null,
                [
                    'admin' => [
                        'environment' => $environment->getSlug(),
                    ]
                ]
            ),
        ]);
    }
}
