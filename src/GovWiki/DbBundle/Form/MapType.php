<?php

namespace GovWiki\DbBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

/**
 * MapType
 */
class MapType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('centerLatitude', 'number')
            ->add('centerLongitude', 'number')
            ->add('zoom', 'integer')
            ->add('countyFile', 'file')
            ->add('governmentsFile', 'file', [ 'required' => false ]);
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'GovWiki\DbBundle\Entity\Map'
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'map';
    }
}
