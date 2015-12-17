<?php

namespace GovWiki\DbBundle\Form;

use Doctrine\ORM\EntityManagerInterface;
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
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('tab', 'entity', [
                'class' => 'GovWiki\DbBundle\Entity\Tab',
            ])
            ->add('category', 'entity', [
                'class' => 'GovWiki\DbBundle\Entity\Category',
                'empty_data' => null,
                'required' => false,
            ])
            ->add('field')
            ->add('description')
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
            ->add('showIn', 'alt_type');
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
