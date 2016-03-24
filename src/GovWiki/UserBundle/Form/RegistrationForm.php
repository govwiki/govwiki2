<?php

namespace GovWiki\UserBundle\Form;

use Doctrine\ORM\EntityRepository;
use GovWiki\ApiBundle\Manager\EnvironmentManager;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;

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
        $environment = $this->manager->getEntity()->getId();

        // Function for query builder generation.
        $queryBuilderFunction =
            function (EntityRepository $repository) use ($environment) {
                $qb = $repository->createQueryBuilder('Government');
                $expr = $qb->expr();

                return $qb
                    ->where($expr->eq('Government.environment', ':environment'))
                    ->setParameter('environment', $environment);
            };

        $builder
            ->add(
                'phone',
                'text',
                [
                    'required' => false,
                    'attr' => [
                        'placeholder' => 'optional, example: 4158675309',
                    ],
                ]
            )
            ->add(
                'subscribedTo',
                'entity',
                [
                    'class' => 'GovWiki\DbBundle\Entity\Government',
                    'required' => false,
                    'label' => 'Subscribe to',
                    'query_builder' => $queryBuilderFunction,
                ]
            );
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
