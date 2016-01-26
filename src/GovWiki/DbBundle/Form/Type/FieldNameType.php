<?php

namespace GovWiki\DbBundle\Form\Type;

use GovWiki\AdminBundle\Manager\AdminEnvironmentManager;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class FieldNameType
 * @package GovWiki\DbBundle\Form\Type
 */
class FieldNameType extends AbstractType
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
        return 'field_name';
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
        $choices = array_merge(
            [ ' ' => ' ' ],
            $this->manager->getGovernmentFields()
        );

        $resolver->setDefaults([
            'choices' => $choices,
            'empty_data' => ' ',
        ]);
    }
}
