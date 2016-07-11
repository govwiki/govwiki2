<?php

namespace GovWiki\DbBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;

/**
 * Class RankLetterRangeType
 * @package GovWiki\DbBundle\Form\Type
 */
class RankLetterRangeType extends AbstractType
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
        $builder
            ->add('a', new RangeType(), [
                'label_attr' => [ 'class' => 'range-grade-label' ],
                'default' => [ 100, 80 ],
            ])
            ->add('b', new RangeType(), [
                'label_attr' => [ 'class' => 'range-grade-label' ],
                'default' => [ 80, 60 ],
            ])
            ->add('c', new RangeType(), [
                'label_attr' => [ 'class' => 'range-grade-label' ],
                'default' => [ 60, 40 ],
            ])
            ->add('d', new RangeType(), [
                'label_attr' => [ 'class' => 'range-grade-label' ],
                'default' => [ 40, 20 ],
            ])
            ->add('f', new RangeType(), [
                'label_attr' => [ 'class' => 'range-grade-label' ],
                'default' => [ 20, 0 ],
            ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'rank_letter_range';
    }

    /**
     * {@inheritdoc}
     */
    public function getParent()
    {
        return 'form';
    }
}
