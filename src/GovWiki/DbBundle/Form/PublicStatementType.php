<?php

namespace GovWiki\DbBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

/**
 * PublicStatementType
 */
class PublicStatementType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('date')
            ->add('summary')
            ->add('url')
            ->add('issueCategory')
        ;
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'GovWiki\DbBundle\Entity\PublicStatement'
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'govwiki_dbbundle_publicstatement';
    }
}
