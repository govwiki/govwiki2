<?php

namespace GovWiki\DbBundle\Form;

use GovWiki\DbBundle\Entity\Government;
use GovWiki\EnvironmentBundle\Manager\Government\GovernmentManagerInterface;
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
     * @param string                      $webDir  Path to web directory.
     * @param EnvironmentStorageInterface $storage A EnvironmentStorageInterface
     *                                             instance.
     */
    public function __construct(
        $webDir,
        EnvironmentStorageInterface $storage
    ) {
        $this->webDir = $webDir;
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
            $governmentFileName = strtolower($government->getAltTypeSlug() .'_'
                . $government->getSlug());

            // Upload government image.
            $file = $event->getForm()->get('imageFile')->getData();

            if ($file instanceof UploadedFile) {
                $filename = 'image_'. $governmentFileName .'.'
                    . $file->getClientOriginalExtension();

                $file->move($this->webDir . $this->uploadDir, $filename);

                $government->setImage($this->uploadDir .'/'. $filename);
            }

            // Upload government logo.
            $file = $event->getForm()->get('secondaryLogo')->getData();

            if ($file instanceof UploadedFile) {
                $filename = 'logo_'. $governmentFileName .'.'
                    . $file->getClientOriginalExtension();

                $file->move($this->webDir . $this->uploadDir, $filename);

                $government->setSecondaryLogoPath($this->uploadDir .'/'. $filename);
            }

            $event->setData($government);
        };

        $builder
            ->add('name')
            ->add('altType', 'alt_type', [ 'multiple' => false ])
            ->add('wikipediaPageName')
            ->add('secondaryLogo', 'file', [ 'required' => false ])
            ->add('secondaryLogoUrl')
            ->add('image', 'hidden')
            ->add('imageFile', 'file', [
                'required' => false,
                'mapped' => false,
            ])
            ->addEventListener(FormEvents::POST_SUBMIT, $listener);

        $builder->get('altType')->resetViewTransformers();
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
