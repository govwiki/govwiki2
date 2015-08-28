<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * FinData
 *
 * @ORM\Table(name="findata")
 * @ORM\Entity
 */
class FinData
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var integer
     *
     * @ORM\Column(name="year", type="integer", nullable=true)
     */
    private $year;

    /**
     * @var string
     *
     * @ORM\Column(name="caption", type="string", length=255, nullable=true)
     */
    private $caption;

    /**
     * @var integer
     *
     * @ORM\Column(name="display_order", type="integer", nullable=true)
     */
    private $displayOrder;

    /**
     * @var string
     *
     * @ORM\Column(name="dollar_amount", type="decimal", precision=20, scale=2, nullable=true)
     */
    private $dollarAmount;

    /**
     * @ORM\ManyToOne(targetEntity="Government", inversedBy="findata")
     */
    private $governments;

    /**
     * @ORM\ManyToOne(targetEntity="Fund", inversedBy="findata")
     */
    private $fund;

    /**
     * @ORM\ManyToOne(targetEntity="CaptionCategory", inversedBy="findata")
     */
    private $captionCategory;

    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set year
     *
     * @param integer $year
     * @return FinData
     */
    public function setYear($year)
    {
        $this->year = $year;

        return $this;
    }

    /**
     * Get year
     *
     * @return integer
     */
    public function getYear()
    {
        return $this->year;
    }

    /**
     * Set caption
     *
     * @param string $caption
     * @return FinData
     */
    public function setCaption($caption)
    {
        $this->caption = $caption;

        return $this;
    }

    /**
     * Get caption
     *
     * @return string
     */
    public function getCaption()
    {
        return $this->caption;
    }

    /**
     * Set displayOrder
     *
     * @param integer $displayOrder
     * @return FinData
     */
    public function setDisplayOrder($displayOrder)
    {
        $this->displayOrder = $displayOrder;

        return $this;
    }

    /**
     * Get displayOrder
     *
     * @return integer
     */
    public function getDisplayOrder()
    {
        return $this->displayOrder;
    }

    /**
     * Set dollarAmount
     *
     * @param string $dollarAmount
     * @return FinData
     */
    public function setDollarAmount($dollarAmount)
    {
        $this->dollarAmount = $dollarAmount;

        return $this;
    }

    /**
     * Get dollarAmount
     *
     * @return string
     */
    public function getDollarAmount()
    {
        return $this->dollarAmount;
    }

    /**
     * Set governments
     *
     * @param \GovWiki\DbBundle\Entity\Government $governments
     * @return FinData
     */
    public function setGovernments(\GovWiki\DbBundle\Entity\Government $governments = null)
    {
        $this->governments = $governments;

        return $this;
    }

    /**
     * Get governments
     *
     * @return \GovWiki\DbBundle\Entity\Government
     */
    public function getGovernments()
    {
        return $this->governments;
    }

    /**
     * Set fund
     *
     * @param \GovWiki\DbBundle\Entity\Fund $fund
     * @return FinData
     */
    public function setFund(\GovWiki\DbBundle\Entity\Fund $fund = null)
    {
        $this->fund = $fund;

        return $this;
    }

    /**
     * Get fund
     *
     * @return \GovWiki\DbBundle\Entity\Fund
     */
    public function getFund()
    {
        return $this->fund;
    }

    /**
     * Set captionCategory
     *
     * @param \GovWiki\DbBundle\Entity\CaptionCategory $captionCategory
     * @return FinData
     */
    public function setCaptionCategory(\GovWiki\DbBundle\Entity\CaptionCategory $captionCategory = null)
    {
        $this->captionCategory = $captionCategory;

        return $this;
    }

    /**
     * Get captionCategory
     *
     * @return \GovWiki\DbBundle\Entity\CaptionCategory
     */
    public function getCaptionCategory()
    {
        return $this->captionCategory;
    }
}
