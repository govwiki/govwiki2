<?php

namespace GovWiki\DbBundle\Form;

use GovWiki\DbBundle\Entity\Category;
use GovWiki\DbBundle\Entity\Tab;
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
                ]),
                'label' => 'Type',
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
        return 'format';
    }
}
