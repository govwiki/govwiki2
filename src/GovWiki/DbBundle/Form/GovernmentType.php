<?php

namespace GovWiki\DbBundle\Form;

use GovWiki\DbBundle\Entity\Government;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class GovernmentType
 * @package GovWiki\DbBundle\Form
 */
class GovernmentType extends AbstractType
{

    /**
     * @var string
     */
    private $uploadDir = '/img/government';

    /**
     * @var EnvironmentStorageInterface
     */
    private $storage;

    /**
     * @param string $webDir Path to web directory.
     */
    public function __construct($webDir, EnvironmentStorageInterface $storage)
    {
        $this->webDir = $webDir;
        $this->storage = $storage;
        $this->uploadDir .= '/'. $storage->get()->getSlug();
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $listener = function (FormEvent $event) {
            /** @var Government $government */
            $government = $event->getData();
            /** @var UploadedFile $file */
            $file = $event->getForm()->get('imageFile')->getData();

            if ($file !== null) {
                $name = $government->getSlug() .'.'. $file->getClientOriginalExtension();

                $file->move($this->webDir . $this->uploadDir, $name);

                $government->setImage($this->uploadDir .'/'. $name);
            }

            $event->setData($government);
        };

        $builder
            ->add('name')
            ->add('altType')
            ->add('wikipediaPageName')
            ->add('secondaryLogo', 'file', [ 'required' => false ])
            ->add('secondaryLogoUrl')
            ->add('image', 'hidden')
            ->add('imageFile', 'file', [
                'required' => false,
                'mapped' => false,
            ])
            ->addEventListener(FormEvents::POST_SUBMIT, $listener);
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'GovWiki\DbBundle\Entity\Government',
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'government';
    }
}
