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
     * @return integer
     */
    public function getId();

    /**
     * @return AbstractType|string
     */
    public static function getFormType();

    /**
     * @param ElectedOfficial $elected  A ElectedOfficial entity instance.
     *
     * @return StaffEntityInterface
     */
    public function setElectedOfficial(ElectedOfficial $elected);
}
