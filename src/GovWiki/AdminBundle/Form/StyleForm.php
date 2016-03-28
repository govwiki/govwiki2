<?php

namespace GovWiki\AdminBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;

/**
 * Class StyleForm
 * @package GovWiki\AdminBundle\Form
 */
class StyleForm extends AbstractType
{

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('styles', 'collection', [
                'type' => new AddStyleForm(),
                'allow_add' => true,
                'allow_delete' => true,
                'options' => [ 'label' => false ],
                'label' => false,
            ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'govwiki_admin_form_styles';
    }
}
