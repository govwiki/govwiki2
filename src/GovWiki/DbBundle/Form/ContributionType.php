<?php

namespace GovWiki\DbBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

/**
 * ContributionType
 */
class ContributionType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('electionYear')
            ->add('contributorName')
            ->add('independentExpenditureDesc')
            ->add('contributionAmount')
            ->add('contributorType')
        ;
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'GovWiki\DbBundle\Entity\Contribution'
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'govwiki_dbbundle_contribution';
    }
}
