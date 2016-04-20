<?php

namespace GovWiki\DbBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;

/**
 * Class ExtGovernmentType
 * @package GovWiki\DbBundle\Form
 */
class ExtGovernmentType extends AbstractType
{

    /**
     * @var array
     */
    private $formats;

    /**
     * @param array $formats Array of field formats.
     */
    public function __construct(array $formats)
    {
        $this->formats = $formats;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        foreach ($this->formats as $format) {
            $format['type'] = ('string' === $format['type']) ? 'text' : 'number';

            $builder->add(
                $format['field'],
                $format['type'],
                [ 'required' => false ]
            );
            if ($format['ranked']) {
                $builder->add(
                    $format['field'] . '_rank',
                    'integer',
                    [ 'required' => false ]
                );
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
