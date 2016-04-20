<?php

namespace GovWiki\DbBundle\Form\Type;

use GovWiki\AdminBundle\Manager\AdminEnvironmentManager;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class ColoringConditionsType
 * @package GovWiki\DbBundle\Form\Type
 */
class ColoringConditionsType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'coloring_conditions';
    }

    /**
     * {@inheritdoc}
     */
    public function getParent()
    {
        return 'form';
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'GovWiki\DbBundle\Doctrine\Type\ColoringConditions\ColoringConditions',
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('colorized', 'checkbox', [ 'required' => false ])
            ->add('fieldName', 'field_name')
            ->add('conditions', 'collection', [
                'type' => new ConditionsType(),
                'allow_delete' => true,
                'allow_add' => true,
                'by_reference' => false,
            ]);
    }
}
