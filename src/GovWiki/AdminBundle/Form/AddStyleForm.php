<?php

namespace GovWiki\AdminBundle\Form;

use GovWiki\AdminBundle\Form\Type\StylePropertyType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class AddStyleForm
 * @package GovWiki\AdminBundle\Form
 */
class AddStyleForm extends AbstractType
{

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('name', 'hidden')
            ->add('className', 'hidden')
            ->add(
                'properties',
                new StylePropertyType(),
                [ 'label' => false ]
            );
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefault('data_class', 'GovWiki\DbBundle\Entity\EnvironmentStyles');
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'govwiki_admin_form_style_row';
    }
}
