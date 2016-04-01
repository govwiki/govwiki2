<?php

namespace GovWiki\DbBundle\Form;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use GovWiki\AdminBundle\Manager\AdminEnvironmentManager;
use GovWiki\ApiBundle\Manager\EnvironmentManager;
use GovWiki\DbBundle\Entity\Document;
use GovWiki\DbBundle\Entity\Format;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class DocumentType
 * @package GovWiki\DbBundle\Form
 */
class DocumentType extends AbstractType
{

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $choices = Document::availableTypes();
        $names = array_map(
            function ($type) {
                return ucfirst($type);
            },
            $choices
        );
        $choices = array_combine($choices, $names);

        $builder
            ->add('name', null, [ 'required' => false ])
            ->add('type', 'choice', [ 'choices' => $choices ])
            ->add('link')
            ->add('year', 'number');
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'GovWiki\DbBundle\Entity\Document',
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'document';
    }
}
