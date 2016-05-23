<?php

namespace GovWiki\DbBundle\Form;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\Repository\GovernmentRepository;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
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
     * @var EnvironmentStorageInterface
     */
    private $storage;

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @param EnvironmentStorageInterface $storage A EnvironmentStorageInterface
     *                                             instance.
     * @param EntityManagerInterface      $em      A EntityManagerInterface
     *                                             instance.
     */
    public function __construct(
        EnvironmentStorageInterface $storage,
        EntityManagerInterface $em
    ) {
        $this->storage = $storage;
        $this->em = $em;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $id = null;
        $elected = $builder->getData();
        if ($elected instanceof ElectedOfficial) {
            $id = $elected->getGovernment()->getId();
        }

        $builder
            ->add('fullName')
            ->add('displayOrder')
            ->add('title')
            ->add('emailAddress', 'email', [ 'required' => false ])
            ->add('telephoneNumber', null, [ 'required' => false ])
            ->add('photoUrl', 'url', [ 'required' => false ])
            ->add('bioUrl', 'url', [ 'required' => false ])
            ->add('termExpires', null, [ 'required' => false ])
            ->add('government', 'entity', [
                'class' => 'GovWiki\DbBundle\Entity\Government',
                'query_builder' => function (EntityRepository $repository) use ($id) {
                    $qb = $repository->createQueryBuilder('Government');
                    $expr = $qb->expr();

                    $qb
                        ->select('partial Government.{id, name}')
                        ->join('Government.environment', 'Environment')
                        ->where($expr->eq(
                            'Environment.slug',
                            $expr->literal($this->storage->get()->getSlug())
                        ))
                        ->orderBy('Government.name');

                    if ($id) {
                        $qb
                            ->andWhere($expr->eq('Government.id', ':government'))
                            ->setParameter('government', $id);
                    } else {
                        $qb->setMaxResults(0);
                    }

                    return $qb;
                },
            ]);

        $builder->get('government')
            ->resetViewTransformers()
            ->addViewTransformer(new CallbackTransformer(
                function ($original) {
                    if ($original instanceof Government) {
                        return $original->getId();
                    }
                    return $original;
                }, function ($id) {
                    /** @var GovernmentRepository $repository */
                    $repository = $this->em
                        ->getRepository('GovWikiDbBundle:Government');

                    return $repository->findOneBy([ 'id' => $id ]);
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
