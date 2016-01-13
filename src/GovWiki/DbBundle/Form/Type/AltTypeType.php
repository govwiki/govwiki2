<?php

namespace GovWiki\DbBundle\Form\Type;

use GovWiki\AdminBundle\Manager\AdminEnvironmentManager;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class AltTypeType
 * @package GovWiki\DbBundle\Form\Type
 */
class AltTypeType extends AbstractType
{
    /**
     * @var AdminEnvironmentManager
     */
    private $manager;

    /**
     * @param AdminEnvironmentManager $manager A AdminEnvironmentManager instance.
     */
    public function __construct(AdminEnvironmentManager $manager)
    {
        $this->manager = $manager;
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'alt_type';
    }

    /**
     * {@inheritdoc}
     */
    public function getParent()
    {
        return 'choice';
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'multiple' => true,
            'choices' => $this->manager->getUsedAltTypes(),
        ]);
    }
}
