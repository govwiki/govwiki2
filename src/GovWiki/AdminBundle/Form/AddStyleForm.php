<?php

namespace GovWiki\AdminBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class AddStyleForm
 * @package GovWiki\AdminBundle\Form
 */
class AddStyleForm extends AbstractType
{
    /**
     * @var string
     */
    private $currentEnvironment;

    /**
     * @param string $currentEnvironment
     */
    public function __construct($currentEnvironment)
    {
        $this->currentEnvironment = $currentEnvironment;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add(
                'environment',
                'entity',
                [
                    'class' => 'GovWikiDbBundle:Environment',
                    'property' => 'name',
                    'data' => $this->currentEnvironment,
                ]
            )
            ->add(
                'name',
                'text',
                [
                    'attr' => [
                        'placeholder' => 'Header links',
                    ],
                ]
            )->add(
                'className',
                'text',
                [
                    'attr' => [
                        'placeholder' => '.header .navigation a',
                    ],
                ]
            )->add(
                'properties',
                'textarea',
                [
                    'attr' => [
                        'placeholder' => "background: #ccc;\ncolor: #000;\nwidth: 200px;",
                    ],
                ]
            );
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'govwiki_admin_form_styles';
    }
}
