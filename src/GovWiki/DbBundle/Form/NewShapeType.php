<?php

namespace GovWiki\DbBundle\Form;

use GovWiki\AdminBundle\Services\ShapeManagerInterface;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class NewShapeType
 * @package GovWiki\AdminBundle\Form
 */
class NewShapeType extends AbstractType
{

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('file', 'file')
            ->add('name');
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'shape_load';
    }
}
