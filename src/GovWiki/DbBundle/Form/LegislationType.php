<?php

namespace GovWiki\DbBundle\Form;

use Doctrine\ORM\EntityRepository;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class LegislationType
 * @package GovWiki\DbBundle\Form
 */
class LegislationType extends AbstractType
{
    /**
     * @var EnvironmentStorageInterface
     */
    private $storage;

    /**
     * @param EnvironmentStorageInterface $storage A EnvironmentStorageInterface
     *                                             instance.
     */
    public function __construct(EnvironmentStorageInterface $storage)
    {
        $this->storage = $storage;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('govAssignedNumber')
            ->add('dateConsidered', 'date')
            ->add('name')
            ->add('summary')
            ->add('evaluatorApprovedPosition')
            ->add('weighting')
            ->add('notes')
            ->add('issueCategory', 'entity', [
                'class' => 'GovWiki\DbBundle\Entity\IssueCategory',
                'choice_label' => 'name',
            ])
            ->add('government', 'entity', [
                'class' => 'GovWiki\DbBundle\Entity\Government',
                'choice_label' => 'name',
                'attr' => [
                    'class' => 'government',
                ],
                'query_builder' => function (EntityRepository $repository) {
                    /*
                     * Select governments only from given environment.
                     */
                    $qb = $repository->createQueryBuilder('Government');
                    $expr = $qb->expr();

                    return $qb
                        ->select('partial Government.{id,name}')
                        ->where($expr->eq('Government.environment', ':environment'))
                        ->setParameter('environment', $this->storage->get()->getId());
                },
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
