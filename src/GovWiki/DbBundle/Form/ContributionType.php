<?php

namespace GovWiki\DbBundle\Form;

use GovWiki\DbBundle\Entity\Contribution;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class ContributionType
 * @package GovWiki\DbBundle\Form
 */
class ContributionType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('electionYear')
            ->add('contributorName')
            ->add('independentExpenditureDesc')
            ->add('contributionAmount')
            ->add('contributorType', 'choice', [
                'choices' => Contribution::getAvailableContributorType()
            ]);
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'GovWiki\DbBundle\Entity\Contribution',
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'govwiki_dbbundle_contribution';
    }
}
