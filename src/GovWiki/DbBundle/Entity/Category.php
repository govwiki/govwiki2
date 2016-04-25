<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints\Choice;

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
     * @var Tab
     *
     * @ORM\ManyToOne(targetEntity="Tab", inversedBy="categories")
     */
    private $tab;

    /**
     * @var Collection
     *
     * @ORM\OneToMany(targetEntity="Format", mappedBy="category")
     */
    private $formats;

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
    public function __toString()
    {
        if ($this->tab !== null) {
            return $this->tab->getName() .' - '. $this->getName();
        }

        return $this->getName();
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

    /**
     * Set tab
     *
     * @param Tab $tab A Tab entity instance.
     *
     * @return Category
     */
    public function setTab(Tab $tab = null)
    {
        $this->tab = $tab;

        return $this;
    }

    /**
     * Get tab
     *
     * @return Tab
     */
    public function getTab()
    {
        return $this->tab;
    }

    /**
     * Add format
     *
     * @param Format $format A Format entity instance.
     *
     * @return Tab
     */
    public function addFormat(Format $format)
    {
        $this->formats[] = $format;

        return $this;
    }

    /**
     * Remove format
     *
     * @param Format $format A Format entity instance.
     *
     * @return Tab
     */
    public function removeFormat(Format $format)
    {
        $this->formats->removeElement($format);

        return $this;
    }

    /**
     * Get format
     *
     * @return Collection
     */
    public function getFormats()
    {
        return $this->formats;
    }
}
