<?php

namespace GovWiki\DbBundle\Form;

use Doctrine\ORM\EntityRepository;
use GovWiki\DbBundle\Entity\Format;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
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
                            $expr->literal($this->storage->get()->getSlug())
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
                            $expr->literal($this->storage->get()->getSlug())
                        ));
                },
            ])
            ->add('field')
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
