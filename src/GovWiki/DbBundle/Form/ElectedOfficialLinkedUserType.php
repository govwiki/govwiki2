<?php

namespace GovWiki\DbBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class ElectedOfficialCommentType
 * @package GovWiki\DbBundle\Form
 */
class ElectedOfficialLinkedUserType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $offered_username = $options['data']['offered_username'];
        $offered_email = $options['data']['offered_email'];
        $builder
            ->add('username', null, array(
                'data' => $offered_username
            ))
            ->add('email', 'email', array(
                'data' => $offered_email
            ))
            ->add('password', null)
            ->add('send_notification_email', 'checkbox', array(
                'required' => false,
                'label' => 'Send notification email to Elected Official'
            ))
        ;
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => null,
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'govwiki_dbbundle_electedofficiallinkeduser';
    }
}
