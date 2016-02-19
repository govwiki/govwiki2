<?php

namespace GovWiki\DbBundle\Form\Transformer;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Shape;
use Symfony\Component\Form\DataTransformerInterface;

/**
 * Class ShapeToNameTransformer
 * @package GovWiki\DbBundle\Form\Transformer
 */
class ShapeToNameTransformer implements DataTransformerInterface
{

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @param EntityManagerInterface $em A EntityManagerInterface instance.
     */
    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    /**
     * {@inheritdoc}
     */
    public function transform($value)
    {
        if (is_string($value)) {
            $entity = $this->em->getRepository('GovWikiDbBundle:Shape')
                ->findOneBy([ 'name' => $value]);

            $value = $entity->getId();
        }

        return $value;
    }


    /**
     * {@inheritdoc}
     */
    public function reverseTransform($value)
    {
        if ($value instanceof Shape) {
            $value = $value->getName();
        }

        return $value;
    }
}
