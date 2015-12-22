<?php

namespace GovWiki\DbBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class MapType
 * @package GovWiki\DbBundle\Form
 */
class MapType extends AbstractType
{
    /**
     * @var boolean
     */
    private $isNew;

    /**
     * @param boolean $isNew Flag, is set build form for new map creation.
     */
    public function __construct($isNew = false)
    {
        $this->isNew = $isNew;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if (! $this->isNew) {
            $builder->add('vizUrl', 'url');
        }
        $builder
            ->add('centerLatitude', 'number')
            ->add('centerLongitude', 'number')
            ->add('zoom', 'integer');
        if ($this->isNew) {
            $builder->add('countyFile', 'file');
        }
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'GovWiki\DbBundle\Entity\Map',
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'map';
    }
}
