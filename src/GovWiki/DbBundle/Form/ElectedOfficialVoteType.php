<?php

namespace GovWiki\DbBundle\Form;

use Doctrine\ORM\EntityRepository;
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
        $vote = $builder->getData();
        if (($vote instanceof ElectedOfficialVote) && ($vote->getId() === null)) {
            $builder->add('legislation', 'entity', [
                'class' => 'GovWikiDbBundle:Legislation',
                'query_builder' => function (EntityRepository $repository) use ($vote) {
                    $qb = $repository->createQueryBuilder('Legislation');
                    $expr = $qb->expr();

                    // Show only not voted legislations.
                    $subDql = $repository->createQueryBuilder('Legislation2')
                        ->select('Legislation2.id')
                        ->join('Legislation2.electedOfficialVotes', 'Vote')
                        ->where($expr->eq('Vote.electedOfficial', ':elected'))
                        ->getDQL();

                    return $qb
                        ->join('Legislation.government', 'Government')
                        ->join('Government.electedOfficials', 'Elected')
                        ->where($expr->andX(
                            $expr->eq('Elected.id', ':elected'),
                            $expr->notIn('Legislation.id', $subDql)
                        ))
                        ->setParameter('elected', $vote->getElectedOfficial()->getId());
                },
            ]);
        }

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
