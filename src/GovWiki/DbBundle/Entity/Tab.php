<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

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

    /**
     * User can add categories to this tab.
     */
    const USER_DEFINED = 'user_defined';

    /**
     * Display related issues(documents).
     */
    const ISSUES = 'issues';

    /**
     * Display related financial statements.
     */
    const FINANCIAL_STATEMENTS = 'financial_statements';

    /**
     * Salaries tab.
     */
    const SALARIES = 'salaries';

    /**
     * Pensions tab.
     */
    const PENSIONS = 'pensions';

    /**
     * Group over tabs into entity menu on government page.
     */
    const GROUP = 'group';

    /**
     * @var Collection
     *
     * @ORM\OneToMany(targetEntity="Category", mappedBy="tab")
     */
    private $categories;

    /**
     * @var string
     *
     * @ORM\Column(length=21)
     * @Assert\Choice(callback="availableTabType")
     */
    private $tabType;

    /**
     * @var Tab
     *
     * @ORM\ManyToOne(targetEntity="Tab", inversedBy="childrens")
     */
    private $parent;

    /**
     * @var Collection
     *
     * @ORM\OneToMany(targetEntity="Tab", mappedBy="parent")
     */
    private $childrens;

    /**
     * Return available tab types.
     *
     * @return array
     */
    public static function availableTabType()
    {
        return [
            self::USER_DEFINED,
            self::ISSUES,
            self::FINANCIAL_STATEMENTS,
            self::SALARIES,
            self::PENSIONS,
        ];
    }

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->categories = new ArrayCollection();
    }

    /**
     * Add categories
     *
     * @param Category $category A Category entity instance.
     *
     * @return Tab
     */
    public function addCategory(Category $category)
    {
        $this->categories[] = $category;

        return $this;
    }

    /**
     * Remove categories
     *
     * @param Category $category A Category entity instance.
     *
     * @return Tab
     */
    public function removeCategory(Category $category)
    {
        $this->categories->removeElement($category);

        return $this;
    }

    /**
     * Get categories
     *
     * @return Collection
     */
    public function getCategories()
    {
        return $this->categories;
    }

    /**
     * Set tabType
     *
     * @param string $type One of
     *                     {@see Tab::availableType}.
     *
     * @return Tab
     */
    public function setTabType($type)
    {
        $this->tabType = $type;

        return $this;
    }

    /**
     * Get tabType
     *
     * @return string
     */
    public function getTabType()
    {
        return $this->tabType;
    }

    /**
     * Set parent
     *
     * @param Tab $parent A Tab entity instance.
     *
     * @return Tab
     */
    public function setParent(Tab $parent = null)
    {
        $this->parent = $parent;

        return $this;
    }

    /**
     * Get parent
     *
     * @return Tab
     */
    public function getParent()
    {
        return $this->parent;
    }

    /**
     * Add children
     *
     * @param Tab $children A Tab entity instance.
     *
     * @return Tab
     */
    public function addChildren(Tab $children)
    {
        $this->childrens[] = $children;
        $children->setParent($this);

        return $this;
    }

    /**
     * Remove children
     *
     * @param Tab $children A Tab entity instance.
     *
     * @return Tab
     */
    public function removeChildren(Tab $children)
    {
        $this->childrens->removeElement($children);

        return $this;
    }

    /**
     * Get childrens
     *
     * @return Collection
     */
    public function getChildrens()
    {
        return $this->childrens;
    }
}
