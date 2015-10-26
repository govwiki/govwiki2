<?php

namespace GovWiki\AdminBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class UserForm
 * @package GovWiki\AdminBundle\Form
 */
class UserForm extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('username', null, [ 'required' => false ])
            ->add('email', null)
            ->add('plainPassword', 'password', [ 'required' => false ])
            ->add('roles', 'choice', [
                'choices' => [
                    'ROLE_SUPER_ADMIN' => 'super_admin',
                    'ROLE_ADMIN' => 'admin',
                    'ROLE_USER' => 'user',
                ],
                'expanded' => true,
                'multiple' => true,
            ]);
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefault('data_class', 'GovWiki\UserBundle\Entity\User');
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'govwiki_admin_form_user';
    }
}
