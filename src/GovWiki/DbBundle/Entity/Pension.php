<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Pension
 *
 * @ORM\Table("pensions")
 * @ORM\Entity()
 */
class Pension extends AbstractEmployeeDetails
{

    /**
     * @var Government
     *
     * @ORM\ManyToOne(targetEntity="Government", inversedBy="pensions")
     */
    protected $government;

    /**
     * @var float
     *
     * @ORM\Column(type="float")
     */
    private $amount;

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
    private $disability;

    /**
     * @var float
     *
     * @ORM\Column(type="float")
     */
    private $total;

    /**
     * @var integer
     *
     * @ORM\Column(type="integer")
     */
    private $yearsOfService;

    /**
     * @var integer
     *
     * @ORM\Column(type="integer")
     */
    private $yearOfRetirement;

    /**
     * @return float
     */
    public function getAmount()
    {
        return $this->amount;
    }

    /**
     * @param float $amount Pension amount.
     *
     * @return Pension
     */
    public function setAmount($amount)
    {
        $this->amount = $amount;

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
     * @param float $benefits Benefits amount.
     *
     * @return Pension
     */
    public function setBenefits($benefits)
    {
        $this->benefits = $benefits;

        return $this;
    }

    /**
     * @return float
     */
    public function getDisability()
    {
        return $this->disability;
    }

    /**
     * @param float $disability Disability amount.
     *
     * @return Pension
     */
    public function setDisability($disability)
    {
        $this->disability = $disability;

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
     * @param float $total Total amount.
     *
     * @return Pension
     */
    public function setTotal($total)
    {
        $this->total = $total;

        return $this;
    }

    /**
     * @return integer
     */
    public function getYearsOfService()
    {
        return $this->yearsOfService;
    }

    /**
     * @param integer $yearsOfService Year of services.
     *
     * @return Pension
     */
    public function setYearsOfService($yearsOfService)
    {
        $this->yearsOfService = $yearsOfService;

        return $this;
    }

    /**
     * @return integer
     */
    public function getYearOfRetirement()
    {
        return $this->yearOfRetirement;
    }

    /**
     * @param integer $yearOfRetirement Year of retirement.
     *
     * @return Pension
     */
    public function setYearOfRetirement($yearOfRetirement)
    {
        $this->yearOfRetirement = $yearOfRetirement;

        return $this;
    }
}
