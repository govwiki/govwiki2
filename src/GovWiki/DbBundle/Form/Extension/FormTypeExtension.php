<?php

namespace GovWiki\DbBundle\Form\Extension;

use Symfony\Component\Form\AbstractTypeExtension;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class FormTypeExtension
 * @package GovWiki\DbBundle\Form\Extension
 */
class FormTypeExtension extends AbstractTypeExtension
{

    /**
     * Configures the options for this type.
     *
     * @param OptionsResolver $resolver The resolver for the options.
     *
     * @return void
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefined('hidden');
        $resolver->addAllowedTypes('hidden', 'boolean');
        $resolver->setDefault('hidden', false);
    }

    /**
     * Builds the view.
     *
     * This method is called after the extended type has built the view to
     * further modify it.
     *
     * @see FormTypeInterface::buildView()
     *
     * @param FormView      $view    The view.
     * @param FormInterface $form    The form.
     * @param array         $options The options.
     *
     * @return void
     */
    public function buildView(FormView $view, FormInterface $form, array $options)
    {
        $view->vars['hidden'] = $options['hidden'];
    }

    /**
     * Returns the name of the type being extended.
     *
     * @return string The name of the type being extended
     */
    public function getExtendedType()
    {
        return 'form';
    }
}
