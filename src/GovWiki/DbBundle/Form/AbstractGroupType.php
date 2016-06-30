<?php

namespace GovWiki\DbBundle\Form;

use GovWiki\DbBundle\Entity\Category;
use GovWiki\DbBundle\Entity\Repository\TabRepository;
use GovWiki\DbBundle\Entity\Tab;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class AbstractGroupType
 * @package GovWiki\DbBundle\Form
 */
class AbstractGroupType extends AbstractType
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
        $subject = $builder->getData();

        $builder
            ->add('name')
            ->add('orderNumber', 'integer');
        if ($subject instanceof Category) {
            $builder->add('decoration', 'choice', [
                'choices' => array_combine(
                    Category::availableDecorations(),
                    Category::availableDecorations()
                ),
            ]);
        } elseif ($subject instanceof Tab) {
            $builder->add('tabType', 'choice', [
                'choices' => array_combine(Tab::availableTabType(), [
                    'Defined By User',
                    'Issues',
                    'Financial Statements',
                    'Salaries',
                    'Pensions',
                    'Group',
                ]),
                'label' => 'Type',
            ]);
            $builder->add('parent', 'entity', [
                'class' => Tab::class,
                'empty_data' => null,
                'query_builder' => function (TabRepository $repository) use ($subject) {
                    $environment = $this->storage->get()->getId();
                    return $repository->getQueryBuilder($environment, $subject->getId());
                },
                'required' => false,
            ]);
        }
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'GovWiki\DbBundle\Entity\AbstractGroup',
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'govwiki_group';
    }
}
