<?php

namespace GovWiki\FileLibraryBundle\Controller;

use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Repository\EnvironmentRepository;
use GovWiki\EnvironmentBundle\Controller\AbstractGovWikiController;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use GovWiki\FileLibraryBundle\Entity\AbstractFile;
use GovWiki\FileLibraryBundle\Entity\Directory;
use GovWiki\FileLibraryBundle\Entity\Document;
use GovWiki\FileLibraryBundle\Repository\FileRepository;
use GovWiki\FileLibraryBundle\Service\DocumentMover\DocumentMoverException;
use GovWiki\FileLibraryBundle\Service\DocumentMover\DocumentMoverService;
use GovWiki\FileLibraryBundle\Storage\Storage;
use GovWiki\FileLibraryBundle\Storage\StorageFactory;
use GovWiki\UserBundle\Entity\User;
use GuzzleHttp\Psr7\Stream;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

/**
 * Class DocumentController
 * @package GovWiki\FileLibraryBundle\Controller
 *
 * @Route("/library", service="govwiki_filelibrary.controller.document")
 */
class DocumentController extends AbstractGovWikiController
{

    /**
     * @var Environment
     */
    private $environment;

    /**
     * @var Storage
     */
    private $storage;

    /**
     * DocumentController constructor.
     *
     * @param StorageFactory              $factory            A StorageFactory
     *                                                        instance.
     * @param EnvironmentStorageInterface $environmentStorage A EnvironmentStorageInterface
     *                                                        instance.
     */
    public function __construct(
        StorageFactory $factory,
        EnvironmentStorageInterface $environmentStorage
    ) {
        $this->environment = $environmentStorage->get();
        $this->storage = $factory->createStorage($this->environment);
    }

    /**
     * @Route("/notify", methods={ "POST" })
     *
     * @param Request $request A HTTP Request instance.
     *
     * @return JsonResponse
     */
    public function notifyAction(Request $request): JsonResponse
    {
        /** @var EnvironmentRepository $repository */
        $repository = $this->getDoctrine()->getRepository(Environment::class);

        $environment = $repository->getByDomain($request->getHost());
        if (! $environment instanceof Environment) {
            return JsonResponse::create([ 'error' => 'Can\'t find environment for this domain' ], 404);
        }

        try {
            $data = \GuzzleHttp\json_decode($request->getContent(), true);
        } catch (\InvalidArgumentException $exception) {
            return JsonResponse::create([ 'error' => 'Invalid payload, should be valid json' ], 404);
        }

        $errors = [];

        if (! isset($data['path']) || ! \is_string($data['path'])) {
            $errors[] = 'Can\'t find required parameter "path" or path is not a string';
        }

        if (! isset($data['size']) || ! \is_numeric($data['size']) || ((int) $data['size'] < 0)) {
            $errors[] = 'Can\'t find required parameter "size" or size is not a positive number';
        }

        if (\count($errors) > 0) {
            return JsonResponse::create([
                'errors' => $errors,
            ], 400);
        }

        $path = $data['path'];
        $size = (int) $data['size'];

        $this->storage->getIndex()->createFile($environment, $path, $size)->flush();

        return JsonResponse::create([], 204);
    }

    /**
     * @Route("/document/{slug}", requirements={ "slug": "[\w-]+" }, methods={ "DELETE" })
     * @Security("is_granted('ROLE_USER')")
     *
     * @param string $slug A removed document slug.
     *
     * @return JsonResponse
     */
    public function removeAction(string $slug): JsonResponse
    {
        /** @var FileRepository $repository */
        $repository = $this->getDoctrine()->getRepository(AbstractFile::class);
        $document = $repository->findBySlug($this->environment->getName(), $slug);

        if (! $document instanceof Document) {
            return JsonResponse::create([ 'error' => 'Removed file not found' ], 404);
        }

        $this->storage->remove($document->getPublicPath());

        return JsonResponse::create(null, 204);
    }

    /**
     * @Route(
     *     "/document/{slug}/move",
     *     requirements={ "slug": "[\w-]+" },
     *     methods={ "PUT" }
     * )
     * @Security("is_granted('ROLE_USER')")
     *
     * @param Request $request A HTTP request.
     * @param string  $slug    A moved file slug.
     *
     * @return JsonResponse
     */
    public function moveAction(Request $request, string $slug): JsonResponse
    {
        /** @var FileRepository $repository */
        $repository = $this->getDoctrine()->getRepository(AbstractFile::class);
        $document = $repository->findBySlug($this->environment->getName(), $slug);

        if (! $document instanceof Document) {
            return JsonResponse::create([ 'error' => 'Moved file not found' ], 404);
        }

        $documentMover = new DocumentMoverService($this->storage);

        $newTopLevelDirId = $request->request->get('topLevelDir');
        if ($newTopLevelDirId === null) {
            return JsonResponse::create([ 'error' => '"topLevelDir" parameter is required' ]);
        }

        /** @var Directory|null $newTopLevelDir */
        $newTopLevelDir = $repository->findById($this->environment->getName(), $newTopLevelDirId);

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
     * @Route(
     *     "/document/{slug}/rename",
     *     requirements={ "slug": "[\w-]+" },
     *     methods={ "PUT" }
     * )
     * @Security("is_granted('ROLE_USER')")
     *
     * @param Request $request A HTTP Request.
     * @param string  $slug    A renamed document slug.
     *
     * @return JsonResponse
     */
    public function renameAction(Request $request, string $slug): JsonResponse
    {
        /** @var FileRepository $repository */
        $repository = $this->getDoctrine()->getRepository(AbstractFile::class);
        $document = $repository->findBySlug($this->environment->getName(), $slug);

        if (! $document instanceof Document) {
            return JsonResponse::create([ 'error' => 'Moved file not found' ], 404);
        }

        $newName = $request->request->get('name');
        if ($newName === null) {
            return JsonResponse::create([ 'error' => '"name" parameter is required' ], 400);
        }

        /** @var DocumentMoverService $documentMover */
        $documentMover = new DocumentMoverService($this->storage);

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
     * @Route(
     *     "/directory/{slug}",
     *     requirements={ "slug": "[\w-]*" },
     *     defaults={ "slug": null },
     *     methods={ "POST" }
     * )
     * @Security("is_granted('ROLE_USER')")
     *
     * @param Request $request A http request.
     * @param string  $slug    A target directory slug.
     *
     * @return JsonResponse
     */
    public function uploadAction(Request $request, string $slug = null): JsonResponse
    {
        /** @var FileRepository $repository */
        $repository = $this->getDoctrine()->getRepository(AbstractFile::class);
        $directory = null;

        if ($slug !== null) {
            $directory = $repository->findBySlug($this->environment->getName(), $slug);
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

        $this->storage->createFile(
            $publicPath . '/'. $file->getClientOriginalName(),
            new Stream(fopen($file->getPathname(), 'rb'))
        );
        \unlink($file->getPathname());

        return JsonResponse::create(null, 204);
    }

    /**
     * @Route(
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
        /** @var FileRepository $repository */
        $repository = $this->getDoctrine()->getRepository(AbstractFile::class);
        $publicPath = '/';

        if ($slug !== null) {
            $directory = $repository->findBySlug($this->environment->getName(), $slug);

            if ($directory === null) {
                return JsonResponse::create([ 'error' => 'Directory not found' ], 404);
            }

            $publicPath = $directory->getPublicPath();
        }

        $search = $request->query->get('search', '');
        $order = $request->query->get('order');
        $limit = $request->query->getInt('limit', 100);
        $offset = $request->query->getInt('offset', 0);

        $directory = $this->storage->getDirectory($publicPath);
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
            'data' => $normalizer->normalize(\iterator_to_array($listBuilder)),
        ]);
    }

    /**
     * @Route("/{slug}", requirements={ "slug": "[\w-]*" }, defaults={ "slug": "" }, methods={ "GET" })
     * @Template
     *
     * @param string $slug A requested document or directory slug.
     *
     * @return RedirectResponse|array
     */
    public function indexAction(string $slug)
    {
        $user = $this->getUser();
        /** @var FileRepository $repository */
        $repository = $this->getDoctrine()->getRepository(AbstractFile::class);

        $topLevelDirNames = [];
        if ($user instanceof User) {
            $topLevelDirNames = $repository->getTopLevelDirNames($this->environment->getName());
        }

        $file = null;
        if ($slug !== null) {
            $file = $repository->findBySlug($this->environment->getName(), $slug);
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

        return RedirectResponse::create($this->storage->generatePublicUrl($file->getPublicPath()));
    }
}
