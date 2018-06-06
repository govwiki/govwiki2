<?php

namespace GovWiki\FileLibraryBundle\Twig;

use GovWiki\FileLibraryBundle\Entity\Directory;

/**
 * Class Extension
 * @package GovWiki\FileLibraryBundle\Twig
 */
class Extension extends \Twig_Extension
{

    /**
     * Returns a list of filters to add to the existing list.
     *
     * @return \Twig_SimpleFilter[]
     */
    public function getFilters(): array
    {
        return [
            new \Twig_SimpleFilter('directoryBreadcrumb', [ $this, 'directoryBreadcrumb' ], [
                'is_safe' => [ 'html' ],
                'needs_environment' => true,
            ]),
        ];
    }

    /**
     * @param \Twig_Environment $environment A twig environment.
     * @param Directory|null    $directory   A directory for which we should create
     *                                       breadcrumb.
     *
     * @return string
     */
    public function directoryBreadcrumb(
        \Twig_Environment $environment,
        Directory $directory = null
    ): string {
        $data = \array_reverse(self::collectBreadcrumbData($directory), true);

        return $environment->render('GovWikiFileLibraryBundle:Partial:breadcrumb.html.twig', [
            'data' => $data,
        ]);
    }

    /**
     * @param Directory|null $directory A current processed directory.
     * @param array          $result    Internal variable which is used for storing
     *                                  context between recursion call. Should not set.
     *
     * @return array
     */
    private static function collectBreadcrumbData(
        Directory $directory = null,
        array $result = []
    ): array {
        if ($directory === null) {
            $result['Directories'] = null;

            return $result;
        }

        $result[$directory->getName()] = $directory->getSlug();

        return self::collectBreadcrumbData($directory->getParent(), $result);
    }
}
