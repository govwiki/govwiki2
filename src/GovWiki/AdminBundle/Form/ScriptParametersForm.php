<?php

namespace GovWiki\AdminBundle\Form;

use GovWiki\AdminBundle\Entity\ScriptParameter;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\DataMapperInterface;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormInterface;

/**
 * Class ScriptParametersForm
 *
 * @package GovWiki\AdminBundle\Form
 */
class ScriptParametersForm extends AbstractType implements DataMapperInterface
{

    /**
     * {@inheritdoc}
     *
     * @return void
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        /** @var ScriptParameter[] $data */
        $data = $builder->getData();
        self::ensureDataValid($data);

        foreach ($data as $datum) {
            $builder->add($datum->getKey(), null, [ 'required' => false ]);
        }

        $builder->setDataMapper($this);
    }

    /**
     * Maps properties of some data to a list of forms.
     *
     * @param ScriptParameter[]            $data  Structured data.
     * @param \Traversable|FormInterface[] $forms A list of {@link
     *                                            FormInterface} instances.
     *
     * @return void
     */
    public function mapDataToForms($data, $forms) // @codingStandardsIgnoreLine
    {
        /** @var FormInterface[] $forms */
        $forms = \iterator_to_array($forms);
        self::ensureDataValid($data);

        foreach ($data as $datum) {
            $forms[$datum->getKey()]->setData($datum->getValue());
        }
    }

    /**
     * Maps the data of a list of forms into the properties of some data.
     *
     * @param FormInterface[]   $forms A list of {@link FormInterface} instances.
     * @param ScriptParameter[] $data  Structured data.
     *
     * @return void
     */
    public function mapFormsToData($forms, &$data) // @codingStandardsIgnoreLine
    {
        self::ensureDataValid($data);

        foreach ($forms as $form) {
            $name = $form->getName();
            if (! isset($data[$name])) {
                throw new \InvalidArgumentException(\sprintf(
                    'Unknown option "%s"',
                    $name
                ));
            }

            $data[$name]->setValue((string) $form->getData());
        }
    }

    /**
     * {@inheritdoc}
     *
     * @return string
     */
    public function getName(): string
    {
        return 'script_parameters';
    }

    /**
     * @param mixed $data Initialization data.
     *
     * @return void
     */
    private static function ensureDataValid($data)
    {
        if (! \is_array($data)) {
            throw new \InvalidArgumentException(\sprintf(
                'Data for "%s" should be array of "%s"',
                static::class,
                ScriptParameter::class
            ));
        }

        foreach ($data as $datum) {
            if (! $datum instanceof ScriptParameter) {
                throw new \InvalidArgumentException(\sprintf(
                    'Data for "%s" should be array of "%s"',
                    static::class,
                    ScriptParameter::class
                ));
            }
        }
    }
}
