<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints\Choice;
use Symfony\Component\Validator\Constraints\Collection;

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
    /**
     * @var string
     * @ORM\Column()
     * @Choice(callback="availableDecorations")
     */
    private $decoration;

    /**
     * @return array
     */
    public static function availableDecorations()
    {
        return [
            'bold',
            'italic',
            'underline',
        ];
    }

    /**
     * @return string
     */
    public function getDecoration()
    {
        return $this->decoration;
    }

    /**
     * @param string $decoration
     *
     * @return Category
     */
    public function setDecoration($decoration)
    {
        $this->decoration = $decoration;

        return $this;
    }
}
