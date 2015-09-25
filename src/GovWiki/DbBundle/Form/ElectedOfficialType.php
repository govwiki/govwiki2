<?php

namespace GovWiki\DbBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

/**
 * ElectedOfficialType
 */
class ElectedOfficialType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('fullName')
            ->add('slug')
            ->add('displayOrder')
            ->add('title')
            ->add('emailAddress')
            ->add('telephoneNumber')
            ->add('photoUrl')
            ->add('bioUrl')
            ->add('termExpires')
        ;
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'GovWiki\DbBundle\Entity\ElectedOfficial'
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'govwiki_dbbundle_electedofficial';
    }
}
