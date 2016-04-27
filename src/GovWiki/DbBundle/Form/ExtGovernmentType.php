<?php

namespace GovWiki\DbBundle\Form;

use GovWiki\DbBundle\Entity\Government;
use GovWiki\EnvironmentBundle\Manager\Format\FormatManagerInterface;
use GovWiki\EnvironmentBundle\Manager\Government\GovernmentManagerInterface;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class ExtGovernmentType
 * @package GovWiki\DbBundle\Form
 */
class ExtGovernmentType extends AbstractType
{

    /**
     * @var EnvironmentStorageInterface
     */
    protected $storage;

    /**
     * @var FormatManagerInterface
     */
    protected $formatManage;

    /**
     * @param EnvironmentStorageInterface $storage       A EnvironmentStorageInterface
     *                                                   instance.
     * @param FormatManagerInterface      $formatManager A FormatManagerInterface
     *                                                   instance.
     */
    public function __construct(
        EnvironmentStorageInterface $storage,
        FormatManagerInterface $formatManager
    ) {
        $this->storage = $storage;
        $this->formatManage = $formatManager;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        /** @var Government $government */
        $government = $options['government'];
        $environment = $this->storage->get();

        $formats = $this->formatManage
            ->getList($environment, $government->getAltType());

        foreach ($formats as $format) {
            // Generate form field parameters.
            $parameters = [ 'required' => false ];
            if ($format['type'] === 'float') {
                $parameters['attr'] = [ 'step' => 0.01 ];
            }

            $builder->add(
                $format['field'],
                ('string' === $format['type']) ? 'text' : 'number',
                $parameters
            );
        }
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        // Require Government entity as option.
        $resolver
            ->setDefaults([
                'government' => null,
            ])
            ->addAllowedTypes('government', 'GovWiki\DbBundle\Entity\Government')
            ->setRequired('government');
    }


    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'ext_government';
    }
}
