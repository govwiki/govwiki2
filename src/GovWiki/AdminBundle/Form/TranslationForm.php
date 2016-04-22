<?php

namespace GovWiki\AdminBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class TranslationForm
 * @package GovWiki\AdminBundle\Form
 */
class TranslationForm extends AbstractType
{

    /**
     * @var string
     */
    private $type;

    /**
     * @param string $type Form type.
     */
    public function __construct($type = null)
    {
        $this->type = $type;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('translation', $this->type);
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefault('data_class', 'GovWiki\DbBundle\Entity\Translation');
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'govwiki_admin_form_translation';
    }
}
