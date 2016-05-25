<?php

namespace GovWiki\DbBundle\Form;

use GovWiki\DbBundle\Entity\Issue;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormError;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class DocumentType
 * @package GovWiki\DbBundle\Form
 */
class DocumentType extends AbstractType
{

    /**
     * @var string
     */
    private $webDir;

    /**
     * @var string
     */
    private $uploadPath;

    /**
     * @param string $webDir     Path to web directory of application.
     * @param string $uploadPath Path to document upload directory, relative to
     *                           $webDir.
     */
    public function __construct($webDir, $uploadPath)
    {
        $this->webDir = $webDir;
        $this->uploadPath = $uploadPath;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $choices = Issue::availableTypes();
        $names = array_map(
            function ($type) {
                return ucfirst($type);
            },
            $choices
        );
        $choices = array_combine($choices, $names);

        $builder
            ->add('name')
            ->add('description', null, [ 'required' => false ])
            ->add('type', 'choice', [ 'choices' => $choices ])
            ->add('link', null, [ 'required' => false ])
            ->add('file', 'file', [ 'required' => false, 'mapped' => false ])
            ->add('date', 'date', [ 'empty_data' => new \DateTime() ])
            ->addEventListener(
                FormEvents::PRE_SUBMIT,
                function (FormEvent $event) {
                    /*
                     * Additional form validation.
                     */
                    $data = $event->getData();

                    // Link or file must be set.
                    if (! $data['link'] && ! $data['file']) {
                        $error = new FormError('Please provide link or file');
                        $event->getForm()->addError($error);
                    }

                    // Upload file.
                    if ($data['file']) {
                        /** @var UploadedFile $file */
                        $file = $data['file'];
                        $fileName = $file->getClientOriginalName();
                        $file->move(
                            $this->webDir . $this->uploadPath,
                            $fileName
                        );
                        $data['link'] = '/'. $this->uploadPath .'/'. $fileName;
                        unset($data['file']);
                    }

                    $event->setData($data);
                }
            );
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'GovWiki\DbBundle\Entity\Issue',
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
