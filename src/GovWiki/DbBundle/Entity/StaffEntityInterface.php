<?php

namespace GovWiki\DbBundle\Entity;

use Symfony\Component\Form\AbstractType;

/**
 * Interface StaffEntityInterface
 * @package GovWiki\DbBundle\Entity
 */
interface StaffEntityInterface
{
    /**
     * @return AbstractType|string
     */
    public static function getFormType();
}
