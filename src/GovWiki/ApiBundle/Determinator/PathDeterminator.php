<?php

namespace GovWiki\ApiBundle\Determinator;

use Symfony\Component\HttpFoundation\Request;

/**
 * Class PathDeterminator
 * @package GovWiki\ApiBundle\Determinator
 */
class PathDeterminator extends AbstractEnvironmentDeterminator
{
    /**
     * {@inheritdoc}
     */
    public function getSlug(Request $request)
    {
        $slug = '';
        if (null !== $request) {
            $controller = $request->attributes->get('_controller');
            if ((strpos($controller, 'Frontend') !== false) ||
                (strpos($controller, 'Mobile') !== false) ||
                (strpos($controller, 'Api') !== false) ||
                (strpos($controller, 'Comment') !== false)
            ) {
                $slug = $request->attributes->get('environment', '');
            }
        }

        return $slug;
    }
}
