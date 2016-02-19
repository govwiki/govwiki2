<?php

namespace GovWiki\DbBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;

/**
 * Class LegendRowType
 * @package GovWiki\DbBundle\Form
 */
class LegendRowType extends AbstractType
{

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
       $builder
           ->add('shape', 'shape')
           ->add('title')
           ->add('color', 'color')
           ->add('order', 'number');
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'legend_row';
    }
}
