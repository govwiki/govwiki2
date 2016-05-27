<?php

namespace GovWiki\DbBundle\Form;

use GovWiki\DbBundle\Entity\Map;
use GovWiki\EnvironmentBundle\Manager\Government\GovernmentManagerInterface;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class SurveyType
 * @package GovWiki\DbBundle\Form
 */
class SurveyType extends AbstractType
{

    /**
     * @var GovernmentManagerInterface
     */
    private $manager;

    /**
     * @var EnvironmentStorageInterface
     */
    private $storage;

    /**
     * @param GovernmentManagerInterface $manager A GovernmentManagerInterface
     *                                            instance.
     */
    public function __construct(
        GovernmentManagerInterface $manager,
        EnvironmentStorageInterface $storage
    ) {
        $this->manager = $manager;
        $this->storage = $storage;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $usedAltTypes = $this->manager->getUsedAltTypes($this->storage->get());

        $builder->add('altTypes', 'choice', [
            'choices' => array_combine($usedAltTypes, $usedAltTypes),
            'expanded' => true,
            'multiple' => true,
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'GovWiki\DbBundle\Entity\Survey',
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'survey';
    }
}
