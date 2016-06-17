<?php

namespace GovWiki\DbBundle\Form;

use GovWiki\DbBundle\Entity\Government;
use GovWiki\EnvironmentBundle\Manager\Format\FormatManagerInterface;
use GovWiki\EnvironmentBundle\Manager\Government\GovernmentManagerInterface;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormError;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;

/**
 * Class NewExtGovernmentType
 * @package GovWiki\DbBundle\Form
 */
class NewExtGovernmentType extends ExtGovernmentType
{

    /**
     * @var GovernmentManagerInterface
     */
    protected $governmentManager;

    /**
     * @param EnvironmentStorageInterface $storage           A EnvironmentStorageInterface
     *                                                       instance.
     * @param FormatManagerInterface      $formatManager     A FormatManagerInterface
     *                                                       instance.
     * @param GovernmentManagerInterface  $governmentManager A GovernmentManagerInterface
     *                                                       instance.
     */
    public function __construct(
        EnvironmentStorageInterface $storage,
        FormatManagerInterface $formatManager,
        GovernmentManagerInterface $governmentManager
    ) {
        parent::__construct($storage, $formatManager);
        $this->governmentManager = $governmentManager;
    }


    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);

        $environment = $this->storage->get();
        /** @var Government $government */
        $government = $options['government'];

        // Add year input for new record and validation listener.
        // Year must be unique for government.
        $yearValidation = function (FormEvent $event) use ($environment, $government) {
            $data = $event->getData();

            $availableYears = $this->governmentManager
                ->getAvailableYears($environment, $government);

            if (in_array($data['year'], $availableYears, true)) {
                $event->getForm()->addError(new FormError('Year already exists.'));
            }
        };

        $builder
            ->add('year', 'integer', ['attr' => ['min' => 2000]])
            ->addEventListener(FormEvents::PRE_SUBMIT, $yearValidation);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'new_ext_government';
    }
}
