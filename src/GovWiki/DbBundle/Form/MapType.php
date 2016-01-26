<?php

namespace GovWiki\DbBundle\Form;

use GovWiki\DbBundle\Entity\Map;
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
        $builder
            ->add('centerLatitude', 'number')
            ->add('centerLongitude', 'number');

        if (! $this->isNew) {
            $builder
                ->add('zoom', 'integer')
                ->add('position', 'choice', [
                    'choices' => array_combine(
                        Map::availablePositions(),
                        Map::availablePositions()
                    ),
                ])
                ->add(
                    'colorizedCountyConditions',
                    'colorized_county_condition'
                );
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
