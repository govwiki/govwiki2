<?php

namespace GovWiki\AdminBundle\Twig;

use GovWiki\AdminBundle\Manager\AdminEnvironmentManager;

/**
 * Class TwigExtensions
 * @package GovWiki\AdminBundle\Twig
 */
class TwigExtensions extends \Twig_Extension
{
    /**
     * @param AdminEnvironmentManager $manger A AdminEnvironmentManager instance.
     */
    public function __construct(AdminEnvironmentManager $manger)
    {
        $this->manger = $manger;
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
            'styles' => json_encode($this->manger->getStyle()),
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
        ];
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
}
