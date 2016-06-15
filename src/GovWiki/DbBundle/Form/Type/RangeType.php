<?php

namespace GovWiki\DbBundle\Form\Type;

use GovWiki\EnvironmentBundle\Manager\Government\GovernmentManagerInterface;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

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
        $builder->add('start', 'number', [
            'attr' => [ 'min' => 0, 'max' => 100 ],
        ]);
        $builder->add('end', 'number', [
            'attr' => [ 'min' => 0, 'max' => 100 ],
        ]);
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
