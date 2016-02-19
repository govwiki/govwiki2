<?php

namespace GovWiki\AdminBundle\Services;

use GovWiki\DbBundle\Entity\Shape;
use Symfony\Component\HttpFoundation\File\Exception\FileException;

/**
 * Interface ShapeManagerInterface
 * @package GovWiki\AdminBundle\Services
 */
interface ShapeManagerInterface
{
    /**
     * Return list of available shapes.
     *
     * @return array
     */
    public function getList();

    /**
     * Move uploaded file to proper directory.
     *
     * @param Shape $shape A Shape instance.
     *
     * @return ShapeManagerInterface
     *
     * @throws FileException File could not have been moved.
     */
    public function move(Shape $shape);
}
