<?php

namespace GovWiki\EnvironmentBundle\Determinator;

use Symfony\Component\HttpFoundation\Request;

/**
 * Class PathDeterminator
 * @package GovWiki\EnvironmentBundle\Determinator
 */
class PathDeterminator implements EnvironmentDeterminatorInterface
{
    /**
     * {@inheritdoc}
     */
    public function determine(Request $request)
    {
        $slug = '';
        if (null !== $request) {
            $controller = $request->attributes->get('_controller');
            if ((strpos($controller, 'Frontend') !== false) ||
                (strpos($controller, 'Api') !== false) ||
                (strpos($controller, 'Comment') !== false)
            ) {
                $slug = $request->attributes->get('environment', '');
            }
        }

        return $slug;
    }
}
