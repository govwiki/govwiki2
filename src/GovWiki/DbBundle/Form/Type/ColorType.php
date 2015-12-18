<?php

namespace GovWiki\DbBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class ColorType
 * @package GovWiki\DbBundle\Form\Type
 */
class ColorType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'color';
    }

    /**
     * {@inheritdoc}
     */
    public function getParent()
    {
        return 'text';
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'attr' => [
                'class' => 'color-picker',
            ],
        ]);
    }
}
