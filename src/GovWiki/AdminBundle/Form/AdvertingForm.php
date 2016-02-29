<?php

namespace GovWiki\AdminBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class AdvertingForm
 * @package GovWiki\AdminBundle\Form
 */
class AdvertingForm extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add(
                'advertingType',
                'choice',
                [
                    'choices' => [
                        'google_adsense' => 'Google adsense',
                    ],
                    'expanded' => false,
                ]
            )
            ->add(
                'advertingEnable',
                'choice',
                [
                    'choices' => [
                        '0' => 'Disabled',
                        '1' => 'Enabled',
                    ],
                    'expanded' => false,
                ]
            )
            ->add(
                'advertingCode',
                'textarea',
                [
                    'required' => true,
                ]
            )
            ->add('submit', 'submit');
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefault('data_class', 'GovWiki\DbBundle\Entity\Adverting');
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'govwiki_admin_form_adverting';
    }
}
