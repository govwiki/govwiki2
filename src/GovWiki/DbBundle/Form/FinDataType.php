<?php

namespace GovWiki\DbBundle\Form;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use GovWiki\AdminBundle\Manager\AdminEnvironmentManager;
use GovWiki\DbBundle\Entity\Format;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class FinDataType
 * @package GovWiki\DbBundle\Form
 */
class FinDataType extends AbstractType
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
            ->add('year', 'integer')
            ->add('caption')
            ->add('fund', 'entity', [
                'class' => 'GovWiki\DbBundle\Entity\Fund',
            ])
            ->add('captionCategory', 'entity', [
                'class' => 'GovWiki\DbBundle\Entity\CaptionCategory',
            ])
            ->add('displayOrder', 'integer')
            ->add('dollarAmount', 'money', [ 'currency' => 'USD' ])
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
            'data_class' => 'GovWiki\DbBundle\Entity\FinData',
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'fin_data';
    }
}
