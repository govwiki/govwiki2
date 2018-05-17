<?php

namespace GovWiki\DbBundle\Form\Type;

use GovWiki\DbBundle\Entity\ValueObject\EnvironmentFileStorageCredentials;
use GovWiki\FileLibraryBundle\Storage\Adapter\AzureStorageAdapter;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\DataMapperInterface;
use Symfony\Component\Form\Exception;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class EnvironmentLibraryCredentialType
 *
 * @package GovWiki\DbBundle\Form\Type
 */
class EnvironmentLibraryCredentialType extends AbstractType implements DataMapperInterface
{

    /**
     * Builds the form.
     *
     * This method is called for each type in the hierarchy starting from the
     * top most type. Type extensions can further modify the form.
     *
     * @see FormTypeExtensionInterface::buildForm()
     *
     * @param FormBuilderInterface $builder The form builder.
     * @param array                $options The options.
     *
     * @return void
     *
     * @SuppressWarnings(PHPMD.UnusedFormalParameter)
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('adapter', 'choice', [
                'choices' => [
                    AzureStorageAdapter::class => 'Azure File Storage',
                ],
            ])
            ->add('account_name')
            ->add('account_key')
            ->add('share')
            ->setDataMapper($this);
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => EnvironmentFileStorageCredentials::class,
            'empty_data' => null,
        ]);
    }

    /**
     * Maps properties of some data to a list of forms.
     *
     * @param mixed           $data  Structured data
     * @param FormInterface[] $forms A list of {@link FormInterface} instances
     *
     * @throws Exception\UnexpectedTypeException if the type of the data
     *                                           parameter is not supported.
     */
    public function mapDataToForms($data, $forms)
    {
        $forms = \iterator_to_array($forms);

        if ($data instanceof EnvironmentFileStorageCredentials) {
            $forms['adapter']->setData($data->getAdapter());
            $forms['account_name']->setData($data->getCredentials()['account_name'] ?? '');
            $forms['account_key']->setData($data->getCredentials()['account_key'] ?? '');
            $forms['share']->setData($data->getCredentials()['share'] ?? '');
        }
    }

    /**
     * Maps the data of a list of forms into the properties of some data.
     *
     * @param FormInterface[] $forms A list of {@link FormInterface} instances
     * @param mixed           $data  Structured data
     *
     * @throws Exception\UnexpectedTypeException if the type of the data
     *                                           parameter is not supported.
     */
    public function mapFormsToData($forms, &$data)
    {
        $forms = \iterator_to_array($forms);

        $data = new EnvironmentFileStorageCredentials(
            $forms['adapter']->getData(),
            [
                'account_name' => $forms['account_name']->getData(),
                'account_key' => $forms['account_key']->getData(),
                'share' => $forms['share']->getData(),
            ]
        );
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'environment_library_credential';
    }
}
