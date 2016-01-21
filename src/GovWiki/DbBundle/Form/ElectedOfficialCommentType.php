<?php

namespace GovWiki\DbBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class ElectedOfficialCommentType
 * @package GovWiki\DbBundle\Form
 */
class ElectedOfficialCommentType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $comment = $options['data']['current_text'];
        $elected_official_id = $options['data']['electedOfficialId'];
        $builder
            ->add('comment', 'ckeditor', array(
                'data' => $comment,
                'config_name' => 'elected_official_comment_config'
            ))
            ->add('electedOfficialId', 'hidden', array(
                'data' => $elected_official_id
            ));
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
        return 'govwiki_dbbundle_electedofficialcomment';
    }
}
