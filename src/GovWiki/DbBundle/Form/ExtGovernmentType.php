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
     * @var string
     */
    private $altType;

    /**
     * @param AdminEnvironmentManager $manager A AdminEnvironmentManager
     *                                         instance.
     * @param string                  $altType Government alt type.
     */
    public function __construct(AdminEnvironmentManager $manager, $altType = null)
    {
        $this->manager = $manager;
        $this->altType = $altType;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $formats = $this->manager
            ->getFormats(true);

        if ($this->altType) {
            foreach ($formats as $format) {
                if (in_array($this->altType, $format['showIn'], true)) {
                    $format['type'] = ('string' === $format['type']) ? 'text' : 'number';

                    $builder->add($format['field'], $format['type']);
                    if ($format['ranked']) {
                        $builder->add($format['field'] . '_rank', 'integer');
                    }
                }
            }
        } else {
            foreach ($formats as $format) {
                $format['type'] = ('string' === $format['type']) ? 'text' : 'number';

                $builder->add($format['field'], $format['type']);
                if ($format['ranked']) {
                    $builder->add($format['field'] . '_rank', 'integer');
                }
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
