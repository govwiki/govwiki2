<?php

namespace GovWiki\AdminBundle\Form;

use GovWiki\UserBundle\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\CallbackTransformer;
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

        /** @var User $user */
        $user = $builder->getData();

        $options = [ 'attr' => [ 'autocomplete' => 'off' ] ];
        if ($user->getId() !== null) {
            $options = array_merge($options, [ 'required' => false ]);
        }

        $builder
            ->add('username', null, [ 'attr' => [ 'autocomplete' => 'off' ] ])
            ->add('email', null, [ 'attr' => [ 'autocomplete' => 'off' ] ])
            ->add('phone', 'text', [
                'required' => false,
                'attr' => [ 'autocomplete' => 'off' ],
            ])
            ->add(
                'phoneConfirmed',
                'choice',
                [
                    'choices' => [
                        '0' => 'false',
                        '1' => 'true',
                    ],
                    'expanded' => false,
                ]
            )
            ->add('plainPassword', 'password', $options)
            ->add(
                'roles',
                'choice',
                [
                    'choices' => [
                        'ROLE_ADMIN' => 'admin',
                        'ROLE_MANAGER' => 'manager',
                        'ROLE_USER' => 'user',
                    ],
                    'attr' => [ 'class' => 'role-select' ],
                    'expanded' => false,
                    'multiple' => false,
                ]
            )
            ->add(
                'environments',
                'entity',
                [
                    'class'        => 'GovWikiDbBundle:Environment',
                    'attr' => [ 'class' => 'environment-select' ],
                    'choice_label' => 'name',
                    'expanded'     => false,
                    'multiple'     => false,
                    'required'     => false,
                    'data'         => $user->getEnvironments()[0],
                ]
            );

        $builder->get('roles')
            ->addModelTransformer(new CallbackTransformer(
                function (array $original) {
                    // Get one top role.
                    return array_shift($original);
                },
                function ($new) {
                    // Convert to array.
                    return [ $new ];
                }
            ));
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
