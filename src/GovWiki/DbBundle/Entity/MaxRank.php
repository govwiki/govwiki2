<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * MaxRank
 *
 * @ORM\Table(name="max_ranks")
 * @ORM\Entity
 */
class MaxRank
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
     * @ORM\Column(name="violent_crimes_per_100000_population_max_rank", type="integer", nullable=true)
     */
    private $violentCrimesPer100000PopulationMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="property_crimes_per_100000_population_max_rank", type="integer", nullable=true)
     */
    private $propertyCrimesPer100000PopulationMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="frpm_rate_max_rank", type="integer", nullable=true)
     */
    private $frpmRateMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="median_salary_per_full_time_emp_max_rank", type="integer", nullable=true)
     */
    private $medianSalaryPerFullTimeEmpMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="median_benefits_per_ft_emp_max_rank", type="integer", nullable=true)
     */
    private $medianBenefitsPerFtEmpMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="median_total_comp_per_ft_emp_max_rank", type="integer", nullable=true)
     */
    private $medianTotalCompPerFtEmpMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="median_total_comp_over_median_individual_comp_max_rank", type="integer", nullable=true)
     */
    private $medianTotalCompOverMedianIndividualCompMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="total_comp_for_highest_paid_emp_max_rank", type="integer", nullable=true)
     */
    private $totalCompForHighestPaidEmpMaxRank;

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
     * Set violentCrimesPer100000PopulationMaxRank
     *
     * @param integer $violentCrimesPer100000PopulationMaxRank
     * @return MaxRank
     */
    public function setViolentCrimesPer100000PopulationMaxRank($violentCrimesPer100000PopulationMaxRank)
    {
        $this->violentCrimesPer100000PopulationMaxRank = $violentCrimesPer100000PopulationMaxRank;

        return $this;
    }

    /**
     * Get violentCrimesPer100000PopulationMaxRank
     *
     * @return integer
     */
    public function getViolentCrimesPer100000PopulationMaxRank()
    {
        return $this->violentCrimesPer100000PopulationMaxRank;
    }

    /**
     * Set propertyCrimesPer100000PopulationMaxRank
     *
     * @param integer $propertyCrimesPer100000PopulationMaxRank
     * @return MaxRank
     */
    public function setPropertyCrimesPer100000PopulationMaxRank($propertyCrimesPer100000PopulationMaxRank)
    {
        $this->propertyCrimesPer100000PopulationMaxRank = $propertyCrimesPer100000PopulationMaxRank;

        return $this;
    }

    /**
     * Get propertyCrimesPer100000PopulationMaxRank
     *
     * @return integer
     */
    public function getPropertyCrimesPer100000PopulationMaxRank()
    {
        return $this->propertyCrimesPer100000PopulationMaxRank;
    }

    /**
     * Set frpmRateMaxRank
     *
     * @param integer $frpmRateMaxRank
     * @return MaxRank
     */
    public function setFrpmRateMaxRank($frpmRateMaxRank)
    {
        $this->frpmRateMaxRank = $frpmRateMaxRank;

        return $this;
    }

    /**
     * Get frpmRateMaxRank
     *
     * @return integer
     */
    public function getFrpmRateMaxRank()
    {
        return $this->frpmRateMaxRank;
    }

    /**
     * Set medianSalaryPerFullTimeEmpMaxRank
     *
     * @param integer $medianSalaryPerFullTimeEmpMaxRank
     * @return MaxRank
     */
    public function setMedianSalaryPerFullTimeEmpMaxRank($medianSalaryPerFullTimeEmpMaxRank)
    {
        $this->medianSalaryPerFullTimeEmpMaxRank = $medianSalaryPerFullTimeEmpMaxRank;

        return $this;
    }

    /**
     * Get medianSalaryPerFullTimeEmpMaxRank
     *
     * @return integer
     */
    public function getMedianSalaryPerFullTimeEmpMaxRank()
    {
        return $this->medianSalaryPerFullTimeEmpMaxRank;
    }

    /**
     * Set medianBenefitsPerFtEmpMaxRank
     *
     * @param integer $medianBenefitsPerFtEmpMaxRank
     * @return MaxRank
     */
    public function setMedianBenefitsPerFtEmpMaxRank($medianBenefitsPerFtEmpMaxRank)
    {
        $this->medianBenefitsPerFtEmpMaxRank = $medianBenefitsPerFtEmpMaxRank;

        return $this;
    }

    /**
     * Get medianBenefitsPerFtEmpMaxRank
     *
     * @return integer
     */
    public function getMedianBenefitsPerFtEmpMaxRank()
    {
        return $this->medianBenefitsPerFtEmpMaxRank;
    }

    /**
     * Set medianTotalCompPerFtEmpMaxRank
     *
     * @param integer $medianTotalCompPerFtEmpMaxRank
     * @return MaxRank
     */
    public function setMedianTotalCompPerFtEmpMaxRank($medianTotalCompPerFtEmpMaxRank)
    {
        $this->medianTotalCompPerFtEmpMaxRank = $medianTotalCompPerFtEmpMaxRank;

        return $this;
    }

    /**
     * Get medianTotalCompPerFtEmpMaxRank
     *
     * @return integer
     */
    public function getMedianTotalCompPerFtEmpMaxRank()
    {
        return $this->medianTotalCompPerFtEmpMaxRank;
    }

    /**
     * Set medianTotalCompOverMedianIndividualCompMaxRank
     *
     * @param integer $medianTotalCompOverMedianIndividualCompMaxRank
     * @return MaxRank
     */
    public function setMedianTotalCompOverMedianIndividualCompMaxRank($medianTotalCompOverMedianIndividualCompMaxRank)
    {
        $this->medianTotalCompOverMedianIndividualCompMaxRank = $medianTotalCompOverMedianIndividualCompMaxRank;

        return $this;
    }

    /**
     * Get medianTotalCompOverMedianIndividualCompMaxRank
     *
     * @return integer
     */
    public function getMedianTotalCompOverMedianIndividualCompMaxRank()
    {
        return $this->medianTotalCompOverMedianIndividualCompMaxRank;
    }

    /**
     * Set totalCompForHighestPaidEmpMaxRank
     *
     * @param integer $totalCompForHighestPaidEmpMaxRank
     * @return MaxRank
     */
    public function setTotalCompForHighestPaidEmpMaxRank($totalCompForHighestPaidEmpMaxRank)
    {
        $this->totalCompForHighestPaidEmpMaxRank = $totalCompForHighestPaidEmpMaxRank;

        return $this;
    }

    /**
     * Get totalCompForHighestPaidEmpMaxRank
     *
     * @return integer
     */
    public function getTotalCompForHighestPaidEmpMaxRank()
    {
        return $this->totalCompForHighestPaidEmpMaxRank;
    }
}
