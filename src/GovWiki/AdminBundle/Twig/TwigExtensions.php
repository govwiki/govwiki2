<?php

namespace GovWiki\AdminBundle\Twig;

/**
 * Class TwigExtensions
 * @package GovWiki\AdminBundle\Twig
 */
class TwigExtensions extends \Twig_Extension
{
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
    public function getFilters()
    {
        return [
            new \Twig_SimpleFilter('roles_beautify', [
                $this,
                'rolesBeautify'
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
        foreach ($roles as &$role) {
            // Remove ROLE_ prefix
            $role = substr($role, 5);
            $role = strtolower($role);
        }
        return $roles;
    }
}
