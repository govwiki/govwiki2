<?php

namespace GovWiki\AdminBundle\Services;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Shape;

/**
 * Class ShapeManager
 * @package GovWiki\AdminBundle\Services
 */
class ShapeManager implements ShapeManagerInterface
{

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var string
     */
    private $webDir;

    /**
     * @var string
     */
    private $shapesDir;

    /**
     * @param EntityManagerInterface $em        A EntityManagerInterface
     *                                          instance.
     * @param string                 $webDir    Path to web directory.
     * @param string                 $shapesDir Path to shapes directory.
     */
    public function __construct(EntityManagerInterface $em, $webDir, $shapesDir)
    {
        $this->em = $em;
        $this->webDir = $webDir;
        $this->shapesDir = $shapesDir;
    }

    /**
     * {@inheritdoc}
     */
    public function getList()
    {
        $data = $this->em->getRepository('GovWikiDbBundle:Shape')
            ->getList();

        $result = [];
        foreach ($data as $row) {
            $result[$row['id']] = $row['name'];
        }

        return $result;
    }

    /**
     * {@inheritdoc}
     */
    public function move(Shape $shape)
    {
        if ($shape->isUploaded()) {
            $file = $shape->getFile();

            $fileName = strtolower($shape->getName()) .'.svg';

            $file->move($this->webDir . $this->shapesDir, $fileName);
            $shape->setPath('/'. $this->shapesDir . $fileName);
        }
    }
}
