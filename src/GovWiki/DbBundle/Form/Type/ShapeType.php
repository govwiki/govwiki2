<?php

namespace GovWiki\DbBundle\Form\Type;

use GovWiki\AdminBundle\Services\ShapeManagerInterface;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class ShapeType
 * @package GovWiki\AdminBundle\Form
 */
class ShapeType extends AbstractType
{

    /**
     * @var ShapeManagerInterface
     */
    private $manager;

    /**
     * @param ShapeManagerInterface $manager A ShapeManagerInterface instance.
     */
    public function __construct(ShapeManagerInterface $manager)
    {
        $this->manager = $manager;
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'choices' => $this->manager->getList(),
            'attr' => [ 'class' => 'shape-selector' ],
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'shape';
    }

    /**
     * {@inheritdoc}
     */
    public function getParent()
    {
        return 'choice';
    }
}
