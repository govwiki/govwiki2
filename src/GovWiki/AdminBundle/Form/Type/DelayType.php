<?php

namespace GovWiki\AdminBundle\Form\Type;

use FOS\UserBundle\Event\FormEvent;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class DelayType
 * @package GovWiki\DbBundle\Form\Type
 */
class DelayType extends AbstractType
{

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'delay';
    }

    /**
     * {@inheritdoc}
     */
    public function getParent()
    {
        return 'collection';
    }
}
