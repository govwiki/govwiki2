<?php

namespace GovWiki\UserBundle\Form;

use Doctrine\ORM\EntityRepository;
use GovWiki\ApiBundle\Manager\EnvironmentManager;
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
     * @var EnvironmentManager
     */
    private $manager;

    /**
     * @param EnvironmentManager $manager A EnvironmentManager instance.
     */
    public function __construct(EnvironmentManager $manager)
    {
        $this->manager = $manager;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $environment = $this->manager->getEntity();
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
                    'label' => 'form.subscribed_to',
                    'query_builder' => $queryBuilderFunction,
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
                'options' => array('translation_domain' => 'messages'),
                'first_options' => array('label' => 'form.password'),
                'second_options' => array('label' => 'form.password_confirmation'),
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
