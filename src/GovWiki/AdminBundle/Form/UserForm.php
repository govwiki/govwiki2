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
     * @var boolean
     */
    private $new;

    /**
     * @var boolean
     */
    private $show_roles_and_envs_field;

    /**
     * @param boolean $new If set, all fields required. Otherwise, optional.
     * @param boolean $show_roles_and_envs_field If true, show fields for roles and environments.
     */
    public function __construct($new = true, $show_roles_and_envs_field = true)
    {
        $this->new = $new;
        $this->show_roles_and_envs_field = $show_roles_and_envs_field;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $fieldOptions = [ 'required' => false ];
        if ($this->new) {
            $fieldOptions = [];
        }

        $builder
            ->add('username', null)
            ->add('email', null)
            ->add('phone', 'text', [ 'required' => false ])
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
            ->add('plainPassword', 'password', $fieldOptions);
        if ($this->show_roles_and_envs_field) {
            $builder
                ->add(
                    'roles',
                    'choice',
                    [
                        'choices' => [
                            'ROLE_ADMIN' => 'admin',
                            'ROLE_MANAGER' => 'manager',
                            'ROLE_USER' => 'user',
                        ],
                        'expanded' => false,
                        'multiple' => true,
                    ]
                )
                ->add(
                    'environments',
                    'entity',
                    [
                        'class' => 'GovWikiDbBundle:Environment',
                        'choice_label' => 'name',
                        'expanded' => false,
                        'multiple' => false,
                        'required' => false,
                    ]
                )
            ;
        }
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
