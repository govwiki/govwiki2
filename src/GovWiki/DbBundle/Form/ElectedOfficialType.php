<?php

namespace GovWiki\DbBundle\Form;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Entity\Repository\GovernmentRepository;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\CallbackTransformer;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class ElectedOfficialType
 * @package GovWiki\DbBundle\Form
 */
class ElectedOfficialType extends AbstractType
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
        $builder
            ->add('fullName')
            ->add('displayOrder')
            ->add('title')
            ->add('emailAddress', 'email', [ 'required' => false ])
            ->add('telephoneNumber', null, [ 'required' => false ])
            ->add('photoUrl', 'url', [ 'required' => false ])
            ->add('bioUrl', 'url', [ 'required' => false ])
            ->add('termExpires', null, [ 'required' => false ])
            ->add('government', 'text')
            ->add('bio', 'ckeditor', [ 'config_name' => 'elected_official_bio' ]);

        $builder->get('government')
            ->resetViewTransformers()
            ->addViewTransformer(new CallbackTransformer(
                function ($original) {
                    if ($original instanceof Government) {
                        return $original->getName();
                    }
                    return $original;
                }, function ($name) {
                    /** @var GovernmentRepository $repository */
                    $repository = $this->em
                        ->getRepository('GovWikiDbBundle:Government');

                    return $repository->findOneBy([ 'name' => $name ]);
                }
            ));
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'GovWiki\DbBundle\Entity\ElectedOfficial',
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'govwiki_dbbundle_electedofficial';
    }
}
