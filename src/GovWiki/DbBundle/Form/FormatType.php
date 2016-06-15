<?php

namespace GovWiki\DbBundle\Form;

use GovWiki\DbBundle\Entity\Format;
use GovWiki\DbBundle\Form\Type\RankLetterRangeType;
use GovWiki\EnvironmentBundle\Manager\Government\GovernmentManagerInterface;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class FormatType
 * @package GovWiki\DbBundle\Form
 */
class FormatType extends AbstractType
{

    /**
     * @var EnvironmentStorageInterface
     */
    private $storage;

    /**
     * @var GovernmentManagerInterface
     */
    private $manager;

    /**
     * @var integer
     */
    private $count;

    /**
     * @param EnvironmentStorageInterface $storage A EnvironmentStorageInterface
     *                                             instance.
     * @param GovernmentManagerInterface  $manager A GovernmentManagerInterface
     *                                             instance.
     */
    public function __construct(
        EnvironmentStorageInterface $storage,
        GovernmentManagerInterface $manager
    ) {
        $this->storage = $storage;
        $this->manager = $manager;
    }
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $data = $builder->getData();

        $usedAltTypes = $this->manager
            ->getUsedAltTypes($this->storage->get(), true);

        if (! $data instanceof Format) {
            $data = new Format();

            // Generate rank letter range.
            $range = [];
            foreach ($usedAltTypes as $altType) {
                $range[$altType] = [
                    'a' => [
                        'start' => 100,
                        'end' => 80,
                    ],
                    'b' => [
                        'start' => 80,
                        'end' => 60,
                    ],
                    'c' => [
                        'start' => 60,
                        'end' => 40,
                    ],
                    'd' => [
                        'start' => 40,
                        'end' => 20,
                    ],
                    'f' => [
                        'start' => 20,
                        'end' => 0,
                    ],
                ];
            }

            $data->setRankLetterRanges($range);
        } else {
            // Check current range altTypes.
            $currentRanges = $data->getRankLetterRanges();
            $currentAltTypes = array_keys($currentRanges);

            $diff = array_diff($currentAltTypes, $usedAltTypes);
            foreach ($diff as $altType) {
                unset($currentRanges[$altType]);
            }

            $diff = array_diff($usedAltTypes, $currentAltTypes);
            foreach ($diff as $altType) {
                $currentRanges[$altType] = [
                    'a' => [
                        'start' => 100,
                        'end' => 80,
                    ],
                    'b' => [
                        'start' => 80,
                        'end' => 60,
                    ],
                    'c' => [
                        'start' => 60,
                        'end' => 40,
                    ],
                    'd' => [
                        'start' => 40,
                        'end' => 20,
                    ],
                    'f' => [
                        'start' => 20,
                        'end' => 0,
                    ],
                ];
            }

            $data->setRankLetterRanges($currentRanges);
        }
        $this->count = count($usedAltTypes);
        $builder->setData($data);

        $availableTypes = array_combine(
            Format::availableTypes(),
            Format::availableTypes()
        );

        $builder
            ->add('field')
            ->add('name')
            ->add('type', 'choice', [ 'choices' => $availableTypes ])
            ->add('helpText', 'textarea', [ 'required' => false ])
            ->add('mask', null, [ 'required' => false ])
            ->add('ranked', 'checkbox', [ 'required' => false ])
            ->add('rankType', 'choice', [
                'required' => false,
                'empty_data' => Format::RANK_RANGE,
                'choices' => [
                    Format::RANK_RANGE => 'Range',
                    Format::RANK_LETTER => 'Letter',
                ],
            ])
            ->add('rankLetterRanges', 'collection', [
                'required' => false,
                'type' => new RankLetterRangeType(),
            ])
            ->add('dataOrFormula', 'choice', [
                'required' => false,
                'choices' => [
                    'data' => 'Data',
                    'formula' => 'Formula',
                ],
            ])
            ->add('showIn', 'alt_type', [ 'required' => false ]);
    }

    /**
     * Builds the form view.
     *
     * This method is called for each type in the hierarchy starting from the
     * top most type. Type extensions can further modify the view.
     *
     * A view of a form is built before the views of the child forms are built.
     * This means that you cannot access child views in this method. If you need
     * to do so, move your logic to {@link finishView()} instead.
     *
     * @see FormTypeExtensionInterface::buildView()
     *
     * @param FormView      $view    The view.
     * @param FormInterface $form    The form.
     * @param array         $options The options.
     *
     * @return void
     */
    public function buildView(FormView $view, FormInterface $form, array $options)
    {
        $view->vars['count'] = $this->count;
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'GovWiki\DbBundle\Entity\Format',
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'format';
    }
}
