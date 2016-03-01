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
     * @var string $offered_username Offered username
     */
    private $offered_username;

    /**
     * @var string $offered_email Offered email
     */
    private $offered_email;

    /**
     * @param string $username Offered username.
     * @param string $email Offered email.
     */
    public function __construct($username = '', $email = '')
    {
        $this->offered_username = $username;
        $this->offered_email = $email;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('username', null, array(
                'data' => $this->offered_username
            ))
            ->add('email', 'email', array(
                'data' => $this->offered_email
            ))
            ->add('plainPassword')
            ->add('send_notification_email', 'checkbox', array(
                'required' => false,
                'mapped' => false
            ))
        ;
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'GovWiki\UserBundle\Entity\User'
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
