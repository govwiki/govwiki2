<?php

namespace GovWiki\AdminBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\CallbackTransformer;
use Symfony\Component\Form\FormBuilderInterface;

/**
 * Class StylePropertyType
 * @package GovWiki\DbBundle\Form\Type
 */
class StylePropertyType extends AbstractType
{

    /**
     * {@inheritdoc}
     *
     * @throws \InvalidArgumentException Transformer callbacks is invalid.
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $transformer = new CallbackTransformer(
            function ($original) {
                /*
                 * Transformer property from array to form view.
                 */
                if (\is_array($original)) {
                    $result = [];
                    foreach ($original as $property) {
                        $result[$property[0]] = $property[1];
                    }
                } else {
                    $result = [
                        'color' => '#ffffff',
                        'background' => '#ffffff',
                    ];
                }

                return $result;
            },
            function ($submitted) {
                /*
                 * Transform submitted data property array.
                 */
                $result = [];
                foreach ($submitted as $key => $value) {
                    $result[] = [ $key, $value ];
                }

                return json_encode($result);
            }
        );

        $builder
            ->add('color', 'color')
            ->add('background', 'color')
            ->addModelTransformer($transformer);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'style_property';
    }

    /**
     * {@inheritdoc}
     */
    public function getParent()
    {
        return 'form';
    }
}
