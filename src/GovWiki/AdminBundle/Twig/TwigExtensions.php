<?php

namespace GovWiki\AdminBundle\Twig;

use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;

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
    public function getGlobals()
    {
        return [
            'admin_styles' => json_encode($this->storage->get()->getStyle()),
            'admin_environment' => $this->storage->get()->getSlug(),
        ];
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
            ])
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
}
