<?php

namespace GovWiki\AdminBundle\Manager;

use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;

/**
 * Class AdminStyleManager
 * @package GovWiki\AdminBundle\Utils
 */
class AdminStyleManager
{
    /**
     * @var FormFactoryInterface
     */
    private $factory;

    /**
     * @var AdminEnvironmentManager
     */
    private $manager;

    /**
     * @var array
     */
    private $currentData = [];

    /**
     * @param FormFactoryInterface    $factory A FormFactoryInterface instance.
     * @param AdminEnvironmentManager $manager A AdminEnvironmentManager
     *                                         instance.
     */
    public function __construct(
        FormFactoryInterface $factory,
        AdminEnvironmentManager $manager
    ) {
        $this->factory = $factory;
        $this->manager = $manager;
    }

    /**
     * Create new style form.
     *
     * @return \Symfony\Component\Form\Form
     */
    public function createForm()
    {
        $styles = $this->manager->getStyle();
        if (count($styles) <= 0) {
            $styles = $this->getDefaultStyles();
        }

        return $this->buildForm($styles)->setData($this->currentData);
    }

    /**
     * Process style form.
     *
     * @param FormInterface $form A FormInterface instance.
     *
     * @return void
     */
    public function processForm(FormInterface $form)
    {
        if (!$form->isSubmitted() || !$form->isValid()) {
            return;
        }

        $styles = $this->manager->getStyle();
        if (count($styles) <= 0) {
            $styles = $this->getDefaultStyles();
        }

        $data = $form->getData();

        /*
         * Build style tree.
         */

        foreach ($data as $field => $value) {
            $elements = explode('-', $field);
            $path = $this->generatePath($styles, $elements);
            eval('$styles'.$path.' = \''. $value.'\';');
        }

        $this->manager->setStyle($styles);
    }

    /**
     * @param array $styles   Array of styles.
     * @param array $elements Path elements.
     *
     * @return string
     */
    private function generatePath(array $styles, array $elements)
    {
        /*
         * Get first path element.
         */
        $element = array_shift($elements);
        list($type, $name) = explode('_', $element, 2);

        $nextType = 'content';
        $nextName = null;
        if (count($elements) > 0) {
            /*
             * Get next path element.
             */
            $nextElement = $elements[0];

            if ('content' !== $nextElement) {
                list($nextType, $nextName) = explode('_', $elements[0], 2);
            }
        }

        foreach ($styles as $idx => $style) {
            /*
             * Find out current element type: block or elem.
             */
            $fieldName = 'block';
            if ('elem' === $type) {
                $fieldName = 'elem';
            }

            /*
             * Check current element type and name.
             */
            if (array_key_exists($fieldName, $style) &&
                $style[$fieldName] === $name) {
                /*
                 * If next element is block or element, recursively build path.
                 */
                if (('block' === $nextType) || ('elem' === $nextType)) {
                    return "[$idx]['content']". $this->generatePath(
                        $style['content'],
                        $elements
                    );
                } else {
                    /*
                     * Next element are mods or attrs.
                     */
                    if (null === $nextName) {
                        return "[$idx]['{$nextType}']";
                    }
                    return "[$idx]['{$nextType}']['$nextName']";
                }

            }
        }
    }

    /**
     * Defaul styles.
     *
     * @return array
     */
    public function getDefaultStyles()
    {
        return [
            [
                'block' => 'page',
                'content' =>
                [
                    [
                        'block' => 'header',
                        'mods' => [ 'color' => '#0B4D70' ],
                        'content' => [
                            [
                                'elem' => 'logo',
                                'attrs' => [ 'src' => 'http://placehold.it/244x60' ],
                            ],
                            [
                                'block' => 'menu',
                                'content' => [
                                    [
                                        'elem' => 'link',
                                        'mods' => [
                                            'color' => '#A8D2F2',
                                            'hover_color' => '#A8D2F2',
                                            'bg_color' => 'transparent',
                                            'bg_hover_color' => '#6C9BB9',
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'block' => 'footer',
                        'mods' => [ 'color' => '#0B4D70' ],
                        'content' => [
                            [
                                'block' => 'copyright',
                                'content' => 'Site copyright (c)',
                            ],
                            [
                                'block' => 'social',
                                'content' => '',
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * Recursively build style form.
     *
     * @param array                $styles  Array of styles.
     * @param FormBuilderInterface $builder A FormBuilderInterface instance.
     *                                      Create new if null.
     * @param string               $parent  Parent block for current block or
     *                                      element.
     *
     * @return FormInterface
     *
     * @throws \InvalidArgumentException Invalid json.
     */
    private function buildForm(
        array $styles,
        FormBuilderInterface $builder = null,
        $parent = null
    ) {
        if (null === $builder) {
            $builder = $this->factory->createBuilder('form');
            $builder->setData([]);
        }

        foreach ($styles as $style) {
            $isBlock = array_key_exists('block', $style);
            $isElement = array_key_exists('elem', $style);

            if ($isBlock && ! $isElement) {
                /*
                 * Build block.
                 */

                $this->buildBlock($builder, $style, $parent);
            } elseif ($isElement && ! $isBlock) {
                /*
                 * Build element.
                 */
                $this->buildElement($builder, $style, $parent);
            } else {
                /*
                 * Invalid entity.
                 */
                throw new \InvalidArgumentException('Invalid json');
            }
        }

        return $builder->getForm();
    }

    /**
     * Build form field for modifications.
     *
     * @param FormBuilderInterface $form   A FormBuilderInterface instance.
     * @param array                $mods   Array of modifications.
     * @param string               $prefix Current processing block or element
     *                                     name.
     *
     * @return void
     */
    private function buildMods(FormBuilderInterface $form, array $mods, $prefix)
    {
        foreach ($mods as $parameter => $currentVale) {
             $name = "{$prefix}-mods_{$parameter}";
            $type = null;
            if (strpos($name, 'color') !== false) {
                $type = 'color';
            }
            $form->add($name, $type, [
                'label' => $this->generateLabel($prefix, $parameter),
            ]);
            $this->currentData[$name] = $currentVale;
        }
    }

    /**
     * @param array $style Current style.
     *
     * @return string
     */
    private function getContentFieldType(array $style)
    {
        if (! array_key_exists('ckeditor', $style)) {
            return 'ckeditor';
        }

        if (true === $style['ckeditor']) {
            return 'ckeditor';
        }

        return 'text';
    }

    /**
     * @param string $parent  Parent block name.
     * @param string $current Current block or element name.
     *
     * @return string
     */
    private function generatePrefix($parent, $current)
    {
        if (null === $parent) {
            return $current;
        }
        return "{$parent}-{$current}";
    }

    /**
     * @param string $prefix    Field name prefix.
     * @param string $fieldName Field name.
     *
     * @return string
     */
    private function generateLabel($prefix, $fieldName)
    {
        $prefix = str_replace(['block_', 'elem_'], '', $prefix);
        $fieldName = str_replace(['block_', 'elem_'], '', $fieldName);

        return ucfirst(
            str_replace(['-', '_'], ' ', $prefix) .' '.
            str_replace(['-', '_'], ' ', $fieldName)
        );
    }

    /**
     * @param FormBuilderInterface $builder A FormBuilderInterface instance.
     * @param array                $style   Array of styles.
     * @param string               $prefix  Prefix for current block.
     *
     * @return void
     */
    private function buildBlock(
        FormBuilderInterface $builder,
        array $style,
        $prefix)
    {
        /*
         * Generate new prefix.
         */
        $prefix = $this->generatePrefix($prefix, 'block_'. $style['block']);

        /*
         * Render block modifications.
         */
        if (array_key_exists('mods', $style)) {
            $this->buildMods(
                $builder,
                $style['mods'],
                $prefix
            );
        }

        if (array_key_exists('content', $style)) {
            /*
             * Render block content.
             */
            if (is_array($style['content'])) {
                /*
                 * If content fields is array, assume that an array of block
                 * or elements.
                 */
                $this->buildForm($style['content'], $builder, $prefix);
            } else {
                /*
                 * Content is text field.
                 */
                $type = $this->getContentFieldType($style);

                $name = $prefix . '-content';
                $builder->add($name, $type, [
                    'label' => $this->generateLabel($prefix, 'content'),
                ]);
                $this->currentData[$name] = $style['content'];
            }
        }
    }

    /**
     * @param FormBuilderInterface $builder A FormBuilderInterface instance.
     * @param array                $style   Array of styles.
     * @param string               $prefix  Prefix for current element.
     *
     * @return void
     */
    private function buildElement(
        FormBuilderInterface $builder,
        array $style,
        $prefix
    ) {
        $prefix = $this->generatePrefix($prefix, 'elem_'. $style['elem']);

        /*
         * Render element modifications.
         */
        if (array_key_exists('mods', $style)) {
            $this->buildMods(
                $builder,
                $style['mods'],
                $prefix
            );
        }

        /*
         * Render element content.
         */
        if (array_key_exists('content', $style)) {
            $type = $this->getContentFieldType($style);

            $name = $prefix . '-content';
            $builder->add($name, $type, [
                'label' => $this->generateLabel($prefix, 'content'),
            ]);
            $this->currentData[$name] = $style['content'];
        }
    }
}
