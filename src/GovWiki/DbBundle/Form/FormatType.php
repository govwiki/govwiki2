<?php

namespace GovWiki\DbBundle\Form;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Format;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * FormatType
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
        $format = $builder->getData();

        if (! $format instanceof Format) {
            throw new \RuntimeException(
                'Invalid data, expect instance of '. Format::class
            );
        }

        $builder
            ->add('category', 'choice')
            ->add('field')
            ->add('category', 'number')
            ->add('centerLongitude', 'number')
            ->add('vizUrl', 'url');
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'GovWiki\DbBundle\Entity\Format'
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
