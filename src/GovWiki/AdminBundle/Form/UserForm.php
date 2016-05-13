<?php

namespace GovWiki\AdminBundle\Form;

use GovWiki\UserBundle\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

/**
 * Class UserForm
 * @package GovWiki\AdminBundle\Form
 */
class UserForm extends AbstractType
{

    /**
     * @var TokenStorageInterface
     */
    private $storage;

    /**
     * @param TokenStorageInterface $storage A TokenStorageInterface instance.
     */
    public function __construct(TokenStorageInterface $storage)
    {
        $this->storage = $storage;
    }

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

        if ($this->getUser()->hasRole('ROLE_ADMIN')) {
            $builder->add(
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
            );
        }

        $builder
            ->add(
                'environments',
                'entity',
                [
                    'class' => 'GovWikiDbBundle:Environment',
                    'choice_label' => 'name',
                    'expanded' => false,
                    'multiple' => false,
                    'required' => false,
                    'data' => $user->getEnvironments()[0],
                ]
            );
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

    /**
     * Get current user.
     *
     * @return User|null
     */
    private function getUser()
    {
        if (null === $token = $this->storage->getToken()) {
            return null;
        }

        if (!is_object($user = $token->getUser())) {
            // e.g. anonymous authentication
            return null;
        }

        return $user;
    }
}
