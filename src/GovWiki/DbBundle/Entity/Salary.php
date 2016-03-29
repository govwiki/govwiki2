<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Salary
 *
 * @ORM\Table("salaries")
 * @ORM\Entity()
 */
class Salary extends AbstractEmployeeDetails
{

    /**
     * @var Government
     *
     * @ORM\ManyToOne(targetEntity="Government", inversedBy="salaries")
     */
    protected $government;

    /**
     * @var float
     *
     * @ORM\Column(type="float")
     */
    private $base;

    /**
     * @var float
     *
     * @ORM\Column(type="float")
     */
    private $overtime;

    /**
     * @var float
     *
     * @ORM\Column(type="float")
     */
    private $other;

    /**
     * @var float
     *
     * @ORM\Column(type="float")
     */
    private $benefits;

    /**
     * @var float
     *
     * @ORM\Column(type="float")
     */
    private $total;

    /**
     * @var float
     *
     * @ORM\Column(type="float")
     */
    private $totalAndBenefits;

    /**
     * @return float
     */
    public function getBase()
    {
        return $this->base;
    }

    /**
     * @param float $base Base pay.
     *
     * @return Salary
     */
    public function setBase($base)
    {
        $this->base = $base;

        return $this;
    }

    /**
     * @return float
     */
    public function getOvertime()
    {
        return $this->overtime;
    }

    /**
     * @param float $overtime Overtime pay.
     *
     * @return Salary
     */
    public function setOvertime($overtime)
    {
        $this->overtime = $overtime;

        return $this;
    }

    /**
     * @return float
     */
    public function getOther()
    {
        return $this->other;
    }

    /**
     * @param float $other Other pay.
     *
     * @return Salary
     */
    public function setOther($other)
    {
        $this->other = $other;

        return $this;
    }

    /**
     * @return float
     */
    public function getBenefits()
    {
        return $this->benefits;
    }

    /**
     * @param float $benefits Benefits.
     *
     * @return Salary
     */
    public function setBenefits($benefits)
    {
        $this->benefits = $benefits;

        return $this;
    }

    /**
     * @return float
     */
    public function getTotal()
    {
        return $this->total;
    }

    /**
     * @param float $total Total pay.
     *
     * @return Salary
     */
    public function setTotal($total)
    {
        $this->total = $total;

        return $this;
    }

    /**
     * @return float
     */
    public function getTotalAndBenefits()
    {
        return $this->totalAndBenefits;
    }

    /**
     * @param float $totalAndBenefits Total pay and benefits.
     *
     * @return Salary
     */
    public function setTotalAndBenefits($totalAndBenefits)
    {
        $this->totalAndBenefits = $totalAndBenefits;

        return $this;
    }
}
