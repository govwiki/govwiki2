<?php

namespace GovWiki\AdminBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class TemplateForm
 * @package GovWiki\AdminBundle\Form
 */
class TemplateForm extends AbstractType
{

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('content', 'ckeditor', [
            'config' => [ 'entities' => false ],
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefault('data_class', 'GovWiki\AdminBundle\Entity\Template');
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'govwiki_admin_form_template';
    }
}
