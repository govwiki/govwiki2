<?php

namespace GovWiki\DbBundle\Form\Type;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\AdminBundle\Services\ShapeManagerInterface;
use GovWiki\DbBundle\Form\Transformer\ShapeToPathTransformer;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class ShapeType
 * @package GovWiki\AdminBundle\Form
 */
class ShapeType extends AbstractType
{

    /**
     * @var ShapeManagerInterface
     */
    private $manager;

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @param ShapeManagerInterface $manager A ShapeManagerInterface instance.
     */
    public function __construct(
        ShapeManagerInterface $manager,
        EntityManagerInterface $em
    ) {
        $this->manager = $manager;
        $this->em = $em;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $transformer = new ShapeToPathTransformer($this->em);
        $builder->addModelTransformer($transformer);
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'attr' => [ 'class' => 'shape-selector' ],
            'class' => 'GovWiki\DbBundle\Entity\Shape',
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'shape';
    }

    /**
     * {@inheritdoc}
     */
    public function getParent()
    {
        return 'entity';
    }
}
