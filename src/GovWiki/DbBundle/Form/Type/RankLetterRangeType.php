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
        $options = [
            'label_attr' => [ 'class' => 'range-grade-label' ],
        ];

        $builder
            ->add('a', new RangeType(), $options)
            ->add('b', new RangeType(), $options)
            ->add('c', new RangeType(), $options)
            ->add('d', new RangeType(), $options)
            ->add('f', new RangeType(), $options);
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
