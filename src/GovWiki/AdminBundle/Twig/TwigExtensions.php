<?php

namespace GovWiki\AdminBundle\Twig;

use GovWiki\DbBundle\Doctrine\Type\ColoringConditions\ConditionInterface;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use GovWiki\FileLibraryBundle\Entity\Directory;

/**
 * Class TwigExtensions
 * @package GovWiki\AdminBundle\Twig
 */
class TwigExtensions extends \Twig_Extension
{

    /**
     * @var EnvironmentStorageInterface
     */
    private $storage;

    /**
     * @param EnvironmentStorageInterface $storage A EnvironmentStorageInterface
     *                                             instance.
     */
    public function __construct(EnvironmentStorageInterface $storage)
    {
        $this->storage = $storage;
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'gov_wiki.admin';
    }

    /**
     * {@inheritdoc}
     */
    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('condition_form_template', [
                $this,
                'getConditionFormTemplate',
            ]),
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function getFilters()
    {
        return [
            new \Twig_SimpleFilter('roles_beautify', [
                $this,
                'rolesBeautify',
            ]),

            new \Twig_SimpleFilter('name_beautify', [
                $this,
                'nameBeautify',
            ]),

            new \Twig_SimpleFilter('condition_type', [
                $this,
                'getConditionType',
            ]),
            new \Twig_SimpleFilter('rootDirectoryBreadcrumb', [ $this, 'directoryBreadcrumb' ], [
                'is_safe' => [ 'html' ],
                'needs_environment' => true,
            ]),
        ];
    }

    /**
     * @param ConditionInterface $condition A ConditionInterface instance.
     *
     * @return string
     */
    public function getConditionFormTemplate(ConditionInterface $condition)
    {
        return '@GovWikiAdmin/Partial/Map/Form/'. strtolower($condition::getType()) .
            '.html.twig';
    }

    /**
     * @param array $roles Roles names array.
     *
     * @return array
     */
    public function rolesBeautify(array $roles = [])
    {
        $result = [];
        foreach ($roles as $role) {
            if ('ROLE_SUPER_ADMIN' !== $role) {
                // Remove ROLE_ prefix
                $result[] = strtolower(substr($role, 5));
            }
        }
        return $result;
    }

    /**
     * @param string $name Field name.
     *
     * @return string
     */
    public function nameBeautify($name)
    {
        /*
         * Split name by uppercase letters.
         */
        return ucfirst(preg_replace('/([A-Z])/', ' $1', $name));
    }

    /**
     * @param ConditionInterface $condition A ConditionInterface instance.
     *
     * @return string
     */
    public function getConditionType(ConditionInterface $condition)
    {
        return $condition::getType();
    }

    /**
     * @param \Twig_Environment $twig        A twig environment.
     * @param Directory|null    $directory   A directory for which we should create
     *                                       breadcrumb.
     * @param Environment       $environment A Environment instance.
     *
     * @return string
     */
    public function directoryBreadcrumb(
        \Twig_Environment $twig,
        Directory $directory = null,
        Environment $environment
    ): string {
        $data = \array_reverse(self::collectBreadcrumbData($directory), true);

        return $twig->render('@GovWikiAdmin/Partial/breadcrumb.html.twig', [
            'environment' => $environment,
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
