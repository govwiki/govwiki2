<?php

namespace GovWiki\DbBundle\Form;

use Doctrine\ORM\EntityRepository;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Form\Type\EnvironmentLibraryCredentialType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class EnvironmentType
 * @package GovWiki\DbBundle\Form
 */
class EnvironmentType extends AbstractType
{

    /**
     * Directory for environment main image upload.
     */
    const DIRECTORY = '/mobile';

    /**
     * @var string
     */
    private $webDir;

    /**
     * @param string $webDir Path to web directory.
     */
    public function __construct($webDir)
    {
        $this->webDir = $webDir;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        /** @var Environment $subject */
        $subject = $builder->getData();
        $id = $subject->getId();

        $listener = function (FormEvent $event) use ($subject) {
            $data = $event->getData();

            if ($data['mainImageFile'] !== null) {
                /** @var UploadedFile $file */
                $file = $data['mainImageFile'];
                $name = $subject->getSlug() .'.'. $file->getClientOriginalExtension();

                $file->move($this->webDir . self::DIRECTORY, $name);

                $data['mainImage'] = self::DIRECTORY .'/'. $name;
            } else {
                $data['mainImage'] = $subject->getMainImage();
            }

            unset($data['mainImageFile']);
            $event->setData($data);
        };

        if (! $subject->getId()) {
            $builder->add('name');
        }

        $builder
            ->add('domain')
            ->add('title')
            ->add('logoHref', 'url', [ 'required' => false ])
            ->add('file', 'file', [
                'required' => false,
                'label' => 'Logo',
            ])
            ->add('mainImage', 'hidden')
            ->add('mainImageFile', 'file', [
                'required' => false,
                'mapped' => false,
            ])
            ->add('analytics', null, [
                'label' => 'Analytics code',
                'attr' => [ 'style' => 'height: 220px' ],
            ])
            ->add('adminEmail')
            ->add('canLogin')
            ->add('canSignUp')
            ->add('libraryCredentials', new EnvironmentLibraryCredentialType());
        if ($subject->getId()) {
            $builder->add('defaultLocale', 'entity', [
                'class'         => 'GovWiki\DbBundle\Entity\Locale',
                'query_builder' => function (EntityRepository $repository) use ($id) {
                    $qb = $repository->createQueryBuilder('Locale');
                    $expr = $qb->expr();

                    return $qb
                        ->select('Locale')
                        ->where($expr->eq('Locale.environment', ':id'))
                        ->setParameter('id', $id);
                },
            ]);
        }
        $builder
            ->add('subscribable', 'checkbox', [ 'required' => false ])
            ->addEventListener(FormEvents::PRE_SUBMIT, $listener);
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
