<?php

namespace GovWiki\DbBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class ElectedOfficialType
 * @package GovWiki\DbBundle\Form
 */
class ElectedOfficialType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('fullName')
            ->add('slug')
            ->add('displayOrder')
            ->add('title')
            ->add('emailAddress', 'email')
            ->add('telephoneNumber')
            ->add('photoUrl', 'url')
            ->add('bioUrl', 'url')
            ->add('termExpires');
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'GovWiki\DbBundle\Entity\ElectedOfficial',
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'govwiki_dbbundle_electedofficial';
    }
}
