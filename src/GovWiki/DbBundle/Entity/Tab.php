<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Tab.
 * Group government fields by tab.
 *
 * @ORM\Entity(
 *  repositoryClass="GovWiki\DbBundle\Entity\Repository\TabRepository"
 * )
 */
class Tab extends AbstractGroup
{
}
