<?php

namespace GovWiki\DbBundle\Form;

use Doctrine\ORM\EntityRepository;
use GovWiki\AdminBundle\Manager\AdminEnvironmentManager;
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
     * @var AdminEnvironmentManager
     */
    private $manager;

    /**
     * @param AdminEnvironmentManager $manager A AdminEnvironmentManager
     *                                         instance.
     */
    public function __construct(AdminEnvironmentManager $manager)
    {
        $this->manager = $manager;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('fullName')
            ->add('displayOrder')
            ->add('title')
            ->add('emailAddress', 'email', [ 'required' => false ])
            ->add('telephoneNumber', null, [ 'required' => false ])
            ->add('photoUrl', 'url', [ 'required' => false ])
            ->add('bioUrl', 'url', [ 'required' => false ])
            ->add('termExpires', null, [ 'required' => false ])
            ->add('government', 'entity', [
                'class' => 'GovWiki\DbBundle\Entity\Government',
                'query_builder' => function (EntityRepository $repository) {
                    $qb = $repository->createQueryBuilder('Government');
                    $expr = $qb->expr();

                    return $qb
                        ->select('partial Government.{id, name}')
                        ->join('Government.environment', 'Environment')
                        ->where($expr->eq(
                            'Environment.slug',
                            $expr->literal($this->manager->getSlug())
                        ));
                },
            ]);
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
