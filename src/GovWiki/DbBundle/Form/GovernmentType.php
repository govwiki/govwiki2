<?php

namespace GovWiki\DbBundle\Form;

use GovWiki\AdminBundle\Manager\AdminEnvironmentManager;
use GovWiki\DbBundle\Entity\Government;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\UrlType;

/**
 * Class GovernmentType
 * @package GovWiki\DbBundle\Form
 */
class GovernmentType extends AbstractType
{
    /**
     * @var AdminEnvironmentManager
     */
    private $manger;

    /**
     * @param AdminEnvironmentManager $manager A AdminEnvironmentManager
     *                                         instance.
     */
    public function __construct(AdminEnvironmentManager $manager)
    {
        $this->manger = $manager;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        /*
         * Add general fields.
         */
        $builder
            ->add('name')
            ->add('altType')
//            ->add('censusContact')
//            ->add('city')
            ->add('wikipediaPageName')
            ->add('secondaryLogo', 'file', [ 'required' => false ])
            ->add('secondaryLogoUrl')
            ->add('latestAuditUrl');

        /** @var Government|null $current */
        $current = $builder->getData();

        if ((null !== $current) && ($current->getId() !== null)) {
            /*
             * Form use for update government, give user a chance to change
             * government environment. Otherwise create government into current
             * environment.
             */
            $builder->add('environment', 'entity', [
                'class' => 'GovWiki\DbBundle\Entity\Environment',
                'data' => $this->manger->getReference()->getId(),
            ]);
        }
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'GovWiki\DbBundle\Entity\Government',
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'government';
    }
}
