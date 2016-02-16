<?php

namespace GovWiki\RequestBundle\Form;

use Doctrine\ORM\EntityRepository;
use GovWiki\ApiBundle\Manager\EnvironmentManagerAwareInterface;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class LegislationRequestType
 * @package GovWiki\DbBundle\Form
 */
class LegislationRequestType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('dateConsidered', 'date')
            ->add('name')
            ->add('summary')
            ->add('issueCategory', 'entity', [
                'class' => 'GovWiki\DbBundle\Entity\IssueCategory',
                'choice_label' => 'name',
            ])
            ->add('electedOfficialVotes', 'collection', [
                'type' => new ElectedOfficialVoteType(),
                'by_reference' => 'false',
            ]);
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'GovWiki\DbBundle\Entity\Legislation',
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'govwiki_dbbundle_legislation';
    }
}
