<?php

namespace GovWiki\DbBundle\Form;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Format;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class EnvironmentType
 * @package GovWiki\DbBundle\Form
 */
class EnvironmentType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('name')
            ->add('domain')
            ->add('title')
            ->add('greetingText', 'ckeditor', array(
                'mapped' => false
            ))
            ->add('bottomText', 'ckeditor', array(
                'mapped' => false
            ))
        ;
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'GovWiki\DbBundle\Entity\Environment',
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'environment';
    }
}
