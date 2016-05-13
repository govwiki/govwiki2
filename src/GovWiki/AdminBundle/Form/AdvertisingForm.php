<?php

namespace GovWiki\AdminBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class AdvertisingForm
 * @package GovWiki\AdminBundle\Form
 */
class AdvertisingForm extends AbstractType
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
                    'label' => 'Type',
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
                    'label' => 'Enable/disable',
                    'expanded' => false,
                ]
            )
            ->add(
                'advertingCode',
                'textarea',
                [
                    'required' => true,
                    'label' => 'Code',
                ]
            );
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefault('data_class', 'GovWiki\DbBundle\Entity\Advertising');
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'govwiki_admin_form_advertising';
    }
}
