<?php

namespace GovWiki\DbBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;

/**
 * Class RangeType
 * @package GovWiki\DbBundle\Form\Type
 */
class RangeType extends AbstractType
{

    /**
     * Builds the form.
     *
     * This method is called for each type in the hierarchy starting from the
     * top most type. Type extensions can further modify the form.
     *
     * @see FormTypeExtensionInterface::buildForm()
     *
     * @param FormBuilderInterface $builder The form builder.
     * @param array                $options The options.
     *
     * @return void
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $options = [
            'type' => 'integer',
            'attr' => [ 'min' => 0, 'max' => 100 ],
            'label_attr' => [ 'class' => 'range-grade-border-label' ],
        ];

        $builder->add('start', 'percent', $options);
        $builder->add('end', 'percent', $options);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'range';
    }

    /**
     * {@inheritdoc}
     */
    public function getParent()
    {
        return 'form';
    }
}
