<?php

namespace GovWiki\DbBundle\Form;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Mapping\ClassMetadataInfo;
use GovWiki\DbBundle\Entity\Format;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Form\Type\RankLetterRangeType;
use GovWiki\EnvironmentBundle\Manager\Format\FormatManagerInterface;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use Metadata\MetadataFactoryInterface;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class FormatType
 * @package GovWiki\DbBundle\Form
 */
class FormatType extends AbstractType
{

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @param EntityManagerInterface $em A EntityManagerInterface instance.
     */
    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $data = $builder->getData();
        $isRanked = false;
        $isLetter = false;
        $isString = (! $data instanceof Format) || ($data->getType() === 'string');
        $isGovernmentSource = false;

        if ($data instanceof Format) {
            $isRanked = $data->isRanked();
            $isLetter = $data->getRankType() === Format::RANK_LETTER;
            $isGovernmentSource = $data->getSource() === Format::SOURCE_GOVERNMENT;
        }

        // Get list of available government field.
        $metadata = $this->em->getClassMetadata(Government::class);
        $fieldNames = $metadata->getFieldNames();
        $fieldNames = array_filter($fieldNames, function ($field) {
            return ! in_array($field, [
                'id',
                'stateId',
                'slug',
                'type',
                'altType',
                'altTypeSlug',
                'image',
                'comment',
                'secondaryLogoPath',
                'secondaryLogoUrl',
                'wikipediaPageName',
            ], true);
        });

        $rankedLabelAttr = [];
        if ($isString) {
            $rankedLabelAttr['style'] = 'display: none';
        }

        if ($isLetter) {
            // Check current range altTypes.
            $currentRanges = $data->getRankLetterRanges();
            $currentAltTypes = array_keys($currentRanges);

            $diff = array_diff($currentAltTypes, $data->getShowIn());
            foreach ($diff as $altType) {
                unset($currentRanges[$altType]);
            }

            $diff = array_diff($data->getShowIn(), $currentAltTypes);
            foreach ($diff as $altType) {
                $altType = str_replace(' ', '_', $altType);
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
            $builder->setData($data);
        }

        $availableTypes = array_combine(
            Format::availableTypes(),
            Format::availableTypes()
        );

        $builder
            ->add('field', 'hidden')
            ->add('fieldName', null, [
                'data' => $data->getField(),
                'hidden' => $isGovernmentSource,
                'mapped' => false,
            ])
            ->add('fieldChoice', 'choice', [
                'data' => $data->getField(),
                'choices' => array_combine($fieldNames, $fieldNames),
                'hidden' => ! $isGovernmentSource,
                'mapped' => false,
            ])
            ->add('name')
            ->add('source', 'choice', [
                'empty_data' => Format::SOURCE_USER_DEFINED,
                'choices' => [
                    Format::SOURCE_USER_DEFINED => 'User Defined',
                    Format::SOURCE_GOVERNMENT => 'Government',
                ],
            ])
            ->add('type', 'choice', [
                'choices' => $availableTypes,
                'hidden' => $isGovernmentSource,
            ])
            ->add('helpText', 'textarea', [
                'required' => false,
                'hidden' => $isGovernmentSource,
            ])
            ->add('mask', null, [
                'required' => false,
                'hidden' => $isGovernmentSource,
            ])
            ->add('ranked', 'checkbox', [
                'required' => false,
                'label_attr' => $rankedLabelAttr,
                'hidden' => $isGovernmentSource,
            ])
            ->add('rankType', 'choice', [
                'empty_data' => Format::RANK_RANGE,
                'choices' => [
                    Format::RANK_RANGE => 'Range',
                    Format::RANK_LETTER => 'Letter',
                ],
                'hidden' => !$isRanked || $isString || $isGovernmentSource,
            ])
            ->add('rankLetterRanges', 'collection', [
                'required' => false,
                'type' => new RankLetterRangeType(),
                'allow_add' => true,
                'allow_delete' => true,
                'hidden' => !$isRanked || !$isLetter || $isGovernmentSource,
            ])
            ->add('dataOrFormula', 'choice', [
                'required' => false,
                'choices' => [
                    'data' => 'Data',
                    'formula' => 'Formula',
                ],
            ])
            ->add('showIn', 'alt_type', [ 'required' => false ]);


        $preSubmit = function (FormEvent $event) use ($metadata) {
            $data = $event->getData();

            if ($data['source'] === Format::SOURCE_USER_DEFINED) {
                $data['field'] = $data['fieldName'];
            } else {
                $data['field'] = $data['fieldChoice'];
                $data['type'] = $metadata->getTypeOfField($data['fieldChoice']);
                $data['ranked'] = false;
            }

            unset($data['fieldName'], $data['fieldChoice']);

            $event->setData($data);
        };

        $builder->addEventListener(FormEvents::PRE_SUBMIT, $preSubmit);
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
