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
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        /** @var Map $map */
        $map = $builder->getData();

        $builder
            ->add('centerLatitude', 'number', [
                'attr' => [
                    'min' => 0.0,
                    'step' => 0.000001,
                ]
            ])
            ->add('centerLongitude', 'number', [
                'attr' => [
                    'min' => 0.0,
                    'step' => 0.000001,
                ]
            ]);

        if ($map->getId()) {
            $builder
                ->add('zoom', 'integer')
                ->add('position', 'choice', [
                    'choices' => array_combine(
                        Map::availablePositions(),
                        Map::availablePositions()
                    ),
                ])
                ->add('legendTypes', 'choice', [
                    'multiple' => true,
                    'choices' => [
                        Map::LEGEND_ALT_TYPES => 'Alt types',
                        Map::LEGEND_COLORS => 'Range',
                    ],
                ])
                ->add('debug', 'checkbox', [ 'required' => false ]);
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
