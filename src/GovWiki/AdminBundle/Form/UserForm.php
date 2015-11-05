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
     * @param boolean $new If set, all fields required. Otherwise, optional.
     */
    public function __construct($new = true)
    {
        $this->new = $new;
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
            ->add('plainPassword', 'password', $fieldOptions)
            ->add('roles', 'choice', [
                'choices' => [
                    'ROLE_ADMIN' => 'admin',
                    'ROLE_USER' => 'user',
                ],
                'expanded' => false,
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
