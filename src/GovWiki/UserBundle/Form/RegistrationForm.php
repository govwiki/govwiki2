<?php

namespace GovWiki\UserBundle\Form;

use Doctrine\ORM\EntityRepository;
use GovWiki\ApiBundle\Manager\EnvironmentManager;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use GovWiki\UserBundle\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;

/**
 * Class RegistrationForm
 * @package GovWiki\UserBundle
 */
class RegistrationForm extends AbstractType
{

    /**
     * @var EnvironmentStorageInterface
     */
    private $storage;

    /**
     * @param EnvironmentStorageInterface $storage A EnvironmentStorageInterface
     *                                             instance.
     */
    public function __construct(EnvironmentStorageInterface $storage)
    {
        $this->storage = $storage;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $environment = $this->storage->get();
        $environment_id = $environment->getId();

        // Function for query builder generation.
        $queryBuilderFunction =
            function (EntityRepository $repository) use ($environment_id) {
                $qb = $repository->createQueryBuilder('Government');
                $expr = $qb->expr();

                return $qb
                    ->where($expr->eq('Government.environment', ':environment'))
                    ->setParameter('environment', $environment_id)
                    ->orderBy($expr->asc('Government.name'));
            };

        $builder
            ->add(
                'phone',
                'text',
                [
                    'required' => false,
                    'attr' => [
                        'placeholder' => 'form.phone.placeholder',
                    ],
                    'label' => 'form.phone',
                ]
            )
            ->add(
                'subscribedTo',
                'entity',
                [
                    'class' => 'GovWiki\DbBundle\Entity\Government',
                    'required' => false,
                    'label' => 'form.subscribe_to',
                    'query_builder' => $queryBuilderFunction,
                    'translation_domain' => 'messages',
                ]
            )
            ->addEventListener(FormEvents::POST_SUBMIT, function(FormEvent $event) use ($environment) {
                /** @var User $user */
                $user = $event->getData();
                $user->addEnvironment($environment);
                $event->setData($user);
            });

        // Change translation domain for password 'repeated' form type.
        // If anyone known how to override translation domain in another way,
        // please do it.
        $builder
            ->remove('plainPassword')
            ->add('plainPassword', 'repeated', [
                'type' => 'password',
                'options' => [ 'translation_domain' => 'messages' ],
                'first_options' => [ 'label' => 'form.password' ],
                'second_options' => [ 'label' => 'form.password_confirmation' ],
                'invalid_message' => 'form.password.mismatch',
            ]);
    }

    /**
     * @return string
     */
    public function getParent()
    {
        return 'fos_user_registration';
    }

    /**
     * @return string
     */
    public function getBlockPrefix()
    {
        return 'app_user_registration';
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->getBlockPrefix();
    }
}
