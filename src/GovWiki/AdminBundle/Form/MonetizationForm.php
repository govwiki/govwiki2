<?php

namespace GovWiki\AdminBundle\Form;

use GovWiki\DbBundle\Entity\Monetization;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class MonetizationForm
 * @package GovWiki\AdminBundle\Form
 */
class MonetizationForm extends AbstractType
{

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('enable', 'choice', [
                'choices' => [
                    true => 'Enable',
                    false => 'Disable',
                ],
            ])
            ->add('code', null, [
                'attr' => [ 'style' => 'height: 250px' ],
            ]);
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefault('data_class', Monetization::class);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'govwiki_admin_form_advertising';
    }
}
