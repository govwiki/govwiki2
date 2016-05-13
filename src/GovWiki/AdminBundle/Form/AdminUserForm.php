<?php

namespace GovWiki\AdminBundle\Form;

use GovWiki\UserBundle\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

/**
 * Class AdminUserForm
 * @package GovWiki\AdminBundle\Form
 */
class AdminUserForm extends AbstractType
{

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {

        /** @var User $user */
        $user = $builder->getData();

        $options = [];
        if ($user->getId() !== null) {
            $options = [ 'required' => false ];
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
            ->add('plainPassword', 'password', $options);
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
        return 'govwiki_admin_form_admin_user';
    }
}
