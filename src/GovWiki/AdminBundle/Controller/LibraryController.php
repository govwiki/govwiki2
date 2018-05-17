<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\FileLibraryBundle\Entity\AbstractFile;
use GovWiki\FileLibraryBundle\Entity\Directory;
use GovWiki\FileLibraryBundle\Repository\FileRepository;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;

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
}
