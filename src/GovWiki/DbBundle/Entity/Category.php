<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Category.
 * Group government fields by category in tab.
 *
 * @ORM\Entity(
 *  repositoryClass="GovWiki\DbBundle\Entity\Repository\CategoryRepository"
 * )
 */
class Category extends AbstractGroup
{
}
