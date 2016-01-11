<?php

namespace GovWiki\DbBundle\Form;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use GovWiki\AdminBundle\Manager\AdminEnvironmentManager;
use GovWiki\ApiBundle\Manager\EnvironmentManager;
use GovWiki\DbBundle\Entity\Format;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class FormatType
 * @package GovWiki\DbBundle\Form
 */
class FormatType extends AbstractType
{
    /**
     * @var AdminEnvironmentManager
     */
    private $manger;

    /**
     * @param AdminEnvironmentManager $manager A AdminEnvironmentManager
     *                                         instance.
     */
    public function __construct(AdminEnvironmentManager $manager)
    {
        $this->manger = $manager;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $availableTypes = array_combine(
            Format::availableTypes(),
            Format::availableTypes()
        );

        $builder
            ->add('tab', 'entity', [
                'class' => 'GovWiki\DbBundle\Entity\Tab',
                'query_builder' => function (EntityRepository $repository) {
                    $qb = $repository->createQueryBuilder('Tab');
                    $expr = $qb->expr();

                    return $qb
                        ->select('partial Tab.{id, name}')
                        ->join('Tab.environment', 'Environment')
                        ->where($expr->eq(
                            'Environment.slug',
                            $expr->literal($this->manger->getSlug())
                        ));
                }
            ])
            ->add('category', 'entity', [
                'class' => 'GovWiki\DbBundle\Entity\Category',
                'empty_data' => null,
                'required' => false,
                'query_builder' => function (EntityRepository $repository) {
                    $qb = $repository->createQueryBuilder('Category');
                    $expr = $qb->expr();

                    return $qb
                        ->select('partial Category.{id, name}')
                        ->join('Category.environment', 'Environment')
                        ->where($expr->eq(
                            'Environment.slug',
                            $expr->literal($this->manger->getSlug())
                        ));
                }
            ])
            ->add('name')
            ->add('type', 'choice', [ 'choices' => $availableTypes ])
            ->add('helpText', 'textarea', [ 'required' => false ])
            ->add('mask', null, [ 'required' => false ])
            ->add('ranked', 'checkbox', [ 'required' => false ])
            ->add('dataOrFormula', 'choice', [
                'required' => false,
                'choices' => [
                    'data' => 'Data',
                    'formula' => 'Formula',
                ],
            ])
            ->add('showIn', 'alt_type', [ 'required' => false ]);
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'GovWiki\DbBundle\Entity\Format',
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'format';
    }
}
