<?php

namespace GovWiki\DbBundle\Form;

use GovWiki\DbBundle\Entity\Format;
use GovWiki\DbBundle\Form\Type\RankLetterRangeType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class FormatType
 * @package GovWiki\DbBundle\Form
 */
class FormatType extends AbstractType
{

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $data = $builder->getData();
        $isRanked = false;
        $isLetter = false;
        $isString = (! $data instanceof Format) || ($data->getType() === 'string');

        if ($data instanceof Format) {
            $isRanked = $data->isRanked();
            $isLetter = $data->getRankType() === Format::RANK_LETTER;
        }

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
            ->add('field')
            ->add('name')
            ->add('type', 'choice', [ 'choices' => $availableTypes ])
            ->add('helpText', 'textarea', [ 'required' => false ])
            ->add('mask', null, [ 'required' => false ])
            ->add('ranked', 'checkbox', [
                'required' => false,
                'label_attr' => $rankedLabelAttr,
            ])
            ->add('rankType', 'choice', [
                'empty_data' => Format::RANK_RANGE,
                'choices' => [
                    Format::RANK_RANGE => 'Range',
                    Format::RANK_LETTER => 'Letter',
                ],
                'hidden' => !$isRanked || $isString,
            ])
            ->add('rankLetterRanges', 'collection', [
                'required' => false,
                'type' => new RankLetterRangeType(),
                'allow_add' => true,
                'allow_delete' => true,
                'hidden' => !$isRanked || !$isLetter,
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
