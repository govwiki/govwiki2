<?php

namespace GovWiki\DbBundle\Form;

use Doctrine\ORM\EntityRepository;
use GovWiki\AdminBundle\Manager\AdminEnvironmentManager;
use GovWiki\DbBundle\Entity\ElectedOfficialVote;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class ElectedOfficialVoteType
 * @package GovWiki\DbBundle\Form
 */
class ElectedOfficialVoteType extends AbstractType
{

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('didElectedOfficialProposeThis', 'choice', [
                'choices' => [
                    1 => 'Yes',
                    0 => 'No',
                ],
            ])
            ->add('vote', 'choice', [
                'choices' => ElectedOfficialVote::getAvailable(),
            ]);
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'GovWiki\DbBundle\Entity\ElectedOfficialVote',
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'govwiki_db_bundle_elected_official_vote';
    }
}
