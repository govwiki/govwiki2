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
     * @var boolean
     */
    private $isCounty;

    /**
     * @param boolean $isCounty Flag, if set don't add shapes.
     */
    public function __construct($isCounty)
    {
        $this->isCounty = $isCounty;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if (! $this->isCounty) {
            $builder->add('shape', 'shape');
        }

        $builder
            ->add('title')
            ->add('color', 'color')
            ->add('order', 'integer');
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'legend_row';
    }
}
