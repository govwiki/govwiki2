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
}
