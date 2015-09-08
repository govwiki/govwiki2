<?php

namespace GovWiki\DbBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

/**
 * LegislationType
 */
class LegislationType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('govAssignedNumber')
            ->add('dateConsidered')
            ->add('name')
            ->add('summary')
            ->add('evaluatorApprovedPosition')
            ->add('weighting')
            ->add('notes')
            ->add('issueCategory')
            ->add('government')
        ;
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'GovWiki\DbBundle\Entity\Legislation'
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'govwiki_dbbundle_legislation';
    }
}
