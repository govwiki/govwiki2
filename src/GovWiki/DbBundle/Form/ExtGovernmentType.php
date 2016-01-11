<?php

namespace GovWiki\DbBundle\Form;

use GovWiki\AdminBundle\Manager\AdminEnvironmentManager;
use GovWiki\DbBundle\Entity\Government;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class ExtGovernmentType
 * @package GovWiki\DbBundle\Form
 */
class ExtGovernmentType extends AbstractType
{
    /**
     * @var AdminEnvironmentManager
     */
    private $manager;

    /**
     * @param AdminEnvironmentManager $manager A AdminEnvironmentManager
     *                                         instance.
     */
    public function __construct(AdminEnvironmentManager $manager)
    {
        $this->manager = $manager;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $formats = $this->manager
            ->getFormats(true);

        foreach ($formats as $format) {
            $format['type'] = ('string' === $format['type'])? 'text' : $format['type'];

            $builder->add($format['field'], $format['type']);
            if ($format['ranked']) {
                $builder->add($format['field']. '_rank', 'integer');
            }
        }
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'ext_government';
    }
}
