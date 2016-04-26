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
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {

        $availableTypes = array_combine(
            Format::availableTypes(),
            Format::availableTypes()
        );

//        $format = $builder->getData();
//        if (($format instanceof Format) && ($format->getId() === null)) {
//            $builder->add('field');
//        }

        $builder
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
