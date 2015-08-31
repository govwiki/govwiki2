<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Median
 *
 * @ORM\Table(name="medians")
 * @ORM\Entity
 */
class Median
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
     * @var string
     *
     * @ORM\Column(name="alt_type", type="string", length=255)
     */
    private $altType;

    /**
     * @var float
     *
     * @ORM\Column(name="per_capita_revenue", type="float", nullable=true)
     */
    private $perCapitaRevenue;

    /**
     * @var float
     *
     * @ORM\Column(name="per_capita_expenditure", type="float", nullable=true)
     */
    private $perCapitaExpenditure;

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
     * Set altType
     *
     * @param string $altType
     * @return Median
     */
    public function setAltType($altType)
    {
        $this->altType = $altType;

        return $this;
    }

    /**
     * Get altType
     *
     * @return string
     */
    public function getAltType()
    {
        return $this->altType;
    }

    /**
     * Set perCapitaRevenue
     *
     * @param float $perCapitaRevenue
     * @return Median
     */
    public function setPerCapitaRevenue($perCapitaRevenue)
    {
        $this->perCapitaRevenue = $perCapitaRevenue;

        return $this;
    }

    /**
     * Get perCapitaRevenue
     *
     * @return float
     */
    public function getPerCapitaRevenue()
    {
        return $this->perCapitaRevenue;
    }

    /**
     * Set perCapitaExpenditure
     *
     * @param float $perCapitaExpenditure
     * @return Median
     */
    public function setPerCapitaExpenditure($perCapitaExpenditure)
    {
        $this->perCapitaExpenditure = $perCapitaExpenditure;

        return $this;
    }

    /**
     * Get perCapitaExpenditure
     *
     * @return float
     */
    public function getPerCapitaExpenditure()
    {
        return $this->perCapitaExpenditure;
    }
}
