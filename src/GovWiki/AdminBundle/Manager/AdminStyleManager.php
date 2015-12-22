<?php

namespace GovWiki\AdminBundle\Manager;

use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Mange styles of environments.
 *
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
     * @var string
     */
    private $uploadDirectory;

    /**
     * @var array
     */
    private $currentData = [];

    /**
     * @param FormFactoryInterface    $factory         A FormFactoryInterface
     *                                                 instance.
     * @param AdminEnvironmentManager $manager         A AdminEnvironmentManager
     *                                                 instance.
     * @param string                  $uploadDirectory Upload directory.
     */
    public function __construct(
        FormFactoryInterface $factory,
        AdminEnvironmentManager $manager,
        $uploadDirectory
    ) {
        $this->factory = $factory;
        $this->manager = $manager;
        $this->uploadDirectory = $uploadDirectory;
    }

    /**
     * Create new style manage form.
     *
     * @return \Symfony\Component\Form\Form
     */
    public function createForm()
    {
        $styles = [];// $this->manager->getStyle();
        if (count($styles) <= 0) {
            $styles = self::getDefaultStyles();
        }

        return $this->buildForm($styles)->setData($this->currentData);
    }

    /**
     * Process style form.
     *
     * @param FormInterface $form A FormInterface instance.
     *
     * @return array
     */
    public function processForm(FormInterface $form)
    {
        $styles = $this->manager->getStyle();
        if (count($styles) <= 0) {
            $styles = self::getDefaultStyles();
        }

        $data = $form->getData();

        /*
         * Build style tree.
         */

        foreach ($data as $field => $value) {
            $elements = explode('-', $field);
            $path = $this->generatePath($styles, $elements);

            if ($value instanceof UploadedFile) {
                /*
                 * Move uploaded file to upload directory.
                 */
                $filename = $this->manager->getSlug() .'.'.
                    $value->getClientOriginalExtension();

                $value->move(
                    $this->uploadDirectory,
                    $filename
                );

                $value = '/img/'. $filename;
            }

            eval('$styles'.$path.' = \''. $value.'\';');
        }

        return $styles;
    }

    /**
     * Generate path to set style options.
     *
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

                    /*
                     * Get mod name and index.
                     */
                    $components = explode('_', $nextName);
                    $index = $components[1];
                    $name = $components[0];
                    if (count($components) === 3) {
                        $index = $components[2];
                        $name = $components[1];
                    }

                    return "[$idx]['{$nextType}'][{$index}]['$name']";
                }

            }
        }
        return '';
    }

    /**
     * Default styles.
     *
     * @return array
     */
    public static function getDefaultStyles()
    {
        return [
            [
                'block' => 'page',
                'content' =>
                [
                    [
                        'block' => 'header',
                        'mods' => [
                            ['backgroundColor' => '#0B4D70'],
                            ['color' => '#0B4D70'],
                        ],
                        'content' => [
                            [
                                'elem' => 'logo',
                                'attrs' => [ ['src' => 'http://placehold.it/244x60'] ],
                            ],
                            [
                                'block' => 'menu',
                                'content' => [
                                    [
                                        'elem' => 'link',
                                        'mods' => [
                                            ['color' => '#A8D2F2'],
                                            [
                                                'color' => '#FFFFFF',
                                                'pseudo' => 'hover',
                                            ],
                                            ['backgroundColor' => '#A8D2F2'],
                                            [
                                                'backgroundColor' => '#FFFFFF',
                                                'pseudo' => 'hover',
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'block' => 'footer',
                        'mods' => [ ['color' => '#0B4D70'] ],
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
     * @param FormBuilderInterface $builder A FormBuilderInterface instance.
     * @param array                $mods    Array of modifications.
     * @param string               $prefix  Current processing block or element
     *                                      name.
     *
     * @return void
     */
    private function buildMods(FormBuilderInterface $builder, array $mods, $prefix)
    {
        foreach ($mods as $index => $mod) {
            /*
             * Assume what first element of array is css attribute.
             */
            $attrName = array_keys($mod)[0];
            $pseudo = '';
            if (array_key_exists('pseudo', $mod)) {
                $pseudo = $mod['pseudo'] . '_';
            }

            $name = "{$prefix}-mods_{$pseudo}{$attrName}_{$index}";
            $type = null;
            if (stripos($name, 'color') !== false) {
                $type = 'color';
            }
            $builder->add($name, $type, [
                'label' => $this->generateLabel($prefix, $pseudo.$attrName),
            ]);

            /*
             * Store current value.
             */
            $this->currentData[$name] = $mod[$attrName];
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
         * Render element attributes.
         */
        if (array_key_exists('attrs', $style)) {
            foreach ($style['attrs'] as $index => $attr) {
                /*
                 * Assume what first element of array is tag attribute.
                 */
                $attrName = array_keys($attr)[0];

                $name = "{$prefix}-attrs_{$attrName}_{$index}";
                $type = null;
                if (strpos($name, 'src') !== false) {
                    $type = 'file';
                }
                $builder->add($name, $type, [
                    'label' => $this->generateLabel($prefix, $attrName),
                    'required' => false,
                ]);

                /*
                 * Store current value.
                 */
                if ('file' !== $type) {
                    $this->currentData[$name] = $attr[$attrName];
                }
            }
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
