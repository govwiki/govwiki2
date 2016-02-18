<?php

namespace GovWiki\DbBundle\Form;

use GovWiki\DbBundle\Entity\Endorsement;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class EndorsementType
 * @package GovWiki\DbBundle\Form
 */
class EndorsementType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('nameOfEndorser')
            ->add('endorserType', 'choice', [
                'choices' => Endorsement::getAvailableEndorserType(),
            ])
            ->add('electionYear');
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'GovWiki\DbBundle\Entity\Endorsement',
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'govwiki_dbbundle_endorsement';
    }
}
