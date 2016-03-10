<?php

namespace GovWiki\DbBundle\Form;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Format;
use GovWiki\DbBundle\Entity\Repository\LocaleRepository;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class EnvironmentType
 * @package GovWiki\DbBundle\Form
 */
class EnvironmentType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        /** @var Environment $subject */
        $subject = $builder->getData();
        $id = $subject->getId();

        $builder
            ->add('name')
            ->add('domain')
            ->add('title')
            ->add('adminEmail')
            ->add('defaultLocale', 'entity', [
                'class' => 'GovWiki\DbBundle\Entity\Locale',
                'query_builder' => function (LocaleRepository $repository) use ($id) {
                    $qb = $repository->createQueryBuilder('Locale');
                    $expr = $qb->expr();

                    return $qb
                        ->select('Locale')
                        ->where($expr->eq('Locale.environment', ':id'))
                        ->setParameter('id', $id);
                },
            ]);
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'GovWiki\DbBundle\Entity\Environment',
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'environment';
    }
}
