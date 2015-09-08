<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation\SerializedName;

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
     * @SerializedName("violent_crimes_per_100000_population_max_rank")
     * @ORM\Column(name="violent_crimes_per_100000_population_max_rank", type="integer", nullable=true)
     */
    private $violentCrimesPer100000PopulationMaxRank;

    /**
     * @var integer
     *
     * @SerializedName("property_crimes_per_100000_population_max_rank")
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
     * @var integer
     *
     * @ORM\Column(name="full_time_employees_over_population_max_rank", type="integer", nullable=true)
     */
    private $fullTimeEmployeesOverPopulationMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="pension_contribution_over_total_revenue_max_rank", type="integer", nullable=true)
     */
    private $pensionContributionOverTotalRevenueMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="opeb_arc_over_total_revenue_max_rank", type="integer", nullable=true)
     */
    private $opebArcOverTotalRevenueMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="pension_plus_opeb_arc_over_tot_rev_max_rank", type="integer", nullable=true)
     */
    private $pensionPlusOpebArcOverTotRevMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="academic_performance_index_max_rank", type="integer", nullable=true)
     */
    private $academicPerformanceIndexMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="sat_scores_max_rank", type="integer", nullable=true)
     */
    private $satScoresMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="sales_tax_rate_max_rank", type="integer", nullable=true)
     */
    private $salesTaxRateMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="library_hours_per_week_max_rank", type="integer", nullable=true)
     */
    private $libraryHoursPerWeekMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="graduation_rate_max_rank", type="integer", nullable=true)
     */
    private $graduationRateMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="dropout_rate_max_rank", type="integer", nullable=true)
     */
    private $dropoutRateMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="total_debt_over_total_revenue_max_rank", type="integer", nullable=true)
     */
    private $totalDebtOverTotalRevenueMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="expenditure_per_student_max_rank", type="integer", nullable=true)
     */
    private $expenditurePerStudentMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="general_fund_balance_over_general_fund_exp_max_rank", type="integer", nullable=true)
     */
    private $generalFundBalanceOverGeneralFundExpMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="gf_surplus_over_gf_revenue_max_rank", type="integer", nullable=true)
     */
    private $gfSurplusOverGfRevenueMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="change_in_governmental_fund_revenue_max_rank", type="integer", nullable=true)
     */
    private $changeInGovernmentalFundRevenueMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="default_probability_max_rank", type="integer", nullable=true)
     */
    private $defaultProbabilityMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="public_safety_exp_over_tot_gov_fund_revenue_max_rank", type="integer", nullable=true)
     */
    private $publicSafetyExpOverTotGovFundRevenueMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="public_safety_exp_over_general_fund_revenue_max_rank", type="integer", nullable=true)
     */
    private $publicSafetyExpOverGeneralFundRevenueMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="total_revenue_per_capita_max_rank", type="integer", nullable=true)
     */
    private $totalRevenuePerCapitaMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="total_expenditures_per_capita_max_rank", type="integer", nullable=true)
     */
    private $totalExpendituresPerCapitaMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="median_total_comp_general_public_max_rank", type="integer", nullable=true)
     */
    private $medianTotalCompGeneralPublicMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="median_home_price_max_rank", type="integer", nullable=true)
     */
    private $medianHomePriceMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="population_max_rank", type="integer", nullable=true)
     */
    private $populationMaxRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="enrollment_max_rank", type="integer", nullable=true)
     */
    private $enrollmentMaxRank;

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

    /**
     * Set fullTimeEmployeesOverPopulationMaxRank
     *
     * @param integer $fullTimeEmployeesOverPopulationMaxRank
     * @return MaxRank
     */
    public function setFullTimeEmployeesOverPopulationMaxRank($fullTimeEmployeesOverPopulationMaxRank)
    {
        $this->fullTimeEmployeesOverPopulationMaxRank = $fullTimeEmployeesOverPopulationMaxRank;

        return $this;
    }

    /**
     * Get fullTimeEmployeesOverPopulationMaxRank
     *
     * @return integer
     */
    public function getFullTimeEmployeesOverPopulationMaxRank()
    {
        return $this->fullTimeEmployeesOverPopulationMaxRank;
    }

    /**
     * Set pensionContributionOverTotalRevenueMaxRank
     *
     * @param integer $pensionContributionOverTotalRevenueMaxRank
     * @return MaxRank
     */
    public function setPensionContributionOverTotalRevenueMaxRank($pensionContributionOverTotalRevenueMaxRank)
    {
        $this->pensionContributionOverTotalRevenueMaxRank = $pensionContributionOverTotalRevenueMaxRank;

        return $this;
    }

    /**
     * Get pensionContributionOverTotalRevenueMaxRank
     *
     * @return integer
     */
    public function getPensionContributionOverTotalRevenueMaxRank()
    {
        return $this->pensionContributionOverTotalRevenueMaxRank;
    }

    /**
     * Set opebArcOverTotalRevenueMaxRank
     *
     * @param integer $opebArcOverTotalRevenueMaxRank
     * @return MaxRank
     */
    public function setOpebArcOverTotalRevenueMaxRank($opebArcOverTotalRevenueMaxRank)
    {
        $this->opebArcOverTotalRevenueMaxRank = $opebArcOverTotalRevenueMaxRank;

        return $this;
    }

    /**
     * Get opebArcOverTotalRevenueMaxRank
     *
     * @return integer
     */
    public function getOpebArcOverTotalRevenueMaxRank()
    {
        return $this->opebArcOverTotalRevenueMaxRank;
    }

    /**
     * Set pensionPlusOpebArcOverTotRevMaxRank
     *
     * @param integer $pensionPlusOpebArcOverTotRevMaxRank
     * @return MaxRank
     */
    public function setPensionPlusOpebArcOverTotRevMaxRank($pensionPlusOpebArcOverTotRevMaxRank)
    {
        $this->pensionPlusOpebArcOverTotRevMaxRank = $pensionPlusOpebArcOverTotRevMaxRank;

        return $this;
    }

    /**
     * Get pensionPlusOpebArcOverTotRevMaxRank
     *
     * @return integer
     */
    public function getPensionPlusOpebArcOverTotRevMaxRank()
    {
        return $this->pensionPlusOpebArcOverTotRevMaxRank;
    }

    /**
     * Set academicPerformanceIndexMaxRank
     *
     * @param integer $academicPerformanceIndexMaxRank
     * @return MaxRank
     */
    public function setAcademicPerformanceIndexMaxRank($academicPerformanceIndexMaxRank)
    {
        $this->academicPerformanceIndexMaxRank = $academicPerformanceIndexMaxRank;

        return $this;
    }

    /**
     * Get academicPerformanceIndexMaxRank
     *
     * @return integer
     */
    public function getAcademicPerformanceIndexMaxRank()
    {
        return $this->academicPerformanceIndexMaxRank;
    }

    /**
     * Set satScoresMaxRank
     *
     * @param integer $satScoresMaxRank
     * @return MaxRank
     */
    public function setSatScoresMaxRank($satScoresMaxRank)
    {
        $this->satScoresMaxRank = $satScoresMaxRank;

        return $this;
    }

    /**
     * Get satScoresMaxRank
     *
     * @return integer
     */
    public function getSatScoresMaxRank()
    {
        return $this->satScoresMaxRank;
    }

    /**
     * Set salesTaxRateMaxRank
     *
     * @param integer $salesTaxRateMaxRank
     * @return MaxRank
     */
    public function setSalesTaxRateMaxRank($salesTaxRateMaxRank)
    {
        $this->salesTaxRateMaxRank = $salesTaxRateMaxRank;

        return $this;
    }

    /**
     * Get salesTaxRateMaxRank
     *
     * @return integer
     */
    public function getSalesTaxRateMaxRank()
    {
        return $this->salesTaxRateMaxRank;
    }

    /**
     * Set libraryHoursPerWeekMaxRank
     *
     * @param integer $libraryHoursPerWeekMaxRank
     * @return MaxRank
     */
    public function setLibraryHoursPerWeekMaxRank($libraryHoursPerWeekMaxRank)
    {
        $this->libraryHoursPerWeekMaxRank = $libraryHoursPerWeekMaxRank;

        return $this;
    }

    /**
     * Get libraryHoursPerWeekMaxRank
     *
     * @return integer
     */
    public function getLibraryHoursPerWeekMaxRank()
    {
        return $this->libraryHoursPerWeekMaxRank;
    }

    /**
     * Set graduationRateMaxRank
     *
     * @param integer $graduationRateMaxRank
     * @return MaxRank
     */
    public function setGraduationRateMaxRank($graduationRateMaxRank)
    {
        $this->graduationRateMaxRank = $graduationRateMaxRank;

        return $this;
    }

    /**
     * Get graduationRateMaxRank
     *
     * @return integer
     */
    public function getGraduationRateMaxRank()
    {
        return $this->graduationRateMaxRank;
    }

    /**
     * Set dropoutRateMaxRank
     *
     * @param integer $dropoutRateMaxRank
     * @return MaxRank
     */
    public function setDropoutRateMaxRank($dropoutRateMaxRank)
    {
        $this->dropoutRateMaxRank = $dropoutRateMaxRank;

        return $this;
    }

    /**
     * Get dropoutRateMaxRank
     *
     * @return integer
     */
    public function getDropoutRateMaxRank()
    {
        return $this->dropoutRateMaxRank;
    }

    /**
     * Set totalDebtOverTotalRevenueMaxRank
     *
     * @param integer $totalDebtOverTotalRevenueMaxRank
     * @return MaxRank
     */
    public function setTotalDebtOverTotalRevenueMaxRank($totalDebtOverTotalRevenueMaxRank)
    {
        $this->totalDebtOverTotalRevenueMaxRank = $totalDebtOverTotalRevenueMaxRank;

        return $this;
    }

    /**
     * Get totalDebtOverTotalRevenueMaxRank
     *
     * @return integer
     */
    public function getTotalDebtOverTotalRevenueMaxRank()
    {
        return $this->totalDebtOverTotalRevenueMaxRank;
    }

    /**
     * Set expenditurePerStudentMaxRank
     *
     * @param integer $expenditurePerStudentMaxRank
     * @return MaxRank
     */
    public function setExpenditurePerStudentMaxRank($expenditurePerStudentMaxRank)
    {
        $this->expenditurePerStudentMaxRank = $expenditurePerStudentMaxRank;

        return $this;
    }

    /**
     * Get expenditurePerStudentMaxRank
     *
     * @return integer
     */
    public function getExpenditurePerStudentMaxRank()
    {
        return $this->expenditurePerStudentMaxRank;
    }

    /**
     * Set generalFundBalanceOverGeneralFundExpMaxRank
     *
     * @param integer $generalFundBalanceOverGeneralFundExpMaxRank
     * @return MaxRank
     */
    public function setGeneralFundBalanceOverGeneralFundExpMaxRank($generalFundBalanceOverGeneralFundExpMaxRank)
    {
        $this->generalFundBalanceOverGeneralFundExpMaxRank = $generalFundBalanceOverGeneralFundExpMaxRank;

        return $this;
    }

    /**
     * Get generalFundBalanceOverGeneralFundExpMaxRank
     *
     * @return integer
     */
    public function getGeneralFundBalanceOverGeneralFundExpMaxRank()
    {
        return $this->generalFundBalanceOverGeneralFundExpMaxRank;
    }

    /**
     * Set gfSurplusOverGfRevenueMaxRank
     *
     * @param integer $gfSurplusOverGfRevenueMaxRank
     * @return MaxRank
     */
    public function setGfSurplusOverGfRevenueMaxRank($gfSurplusOverGfRevenueMaxRank)
    {
        $this->gfSurplusOverGfRevenueMaxRank = $gfSurplusOverGfRevenueMaxRank;

        return $this;
    }

    /**
     * Get gfSurplusOverGfRevenueMaxRank
     *
     * @return integer
     */
    public function getGfSurplusOverGfRevenueMaxRank()
    {
        return $this->gfSurplusOverGfRevenueMaxRank;
    }

    /**
     * Set changeInGovernmentalFundRevenueMaxRank
     *
     * @param integer $changeInGovernmentalFundRevenueMaxRank
     * @return MaxRank
     */
    public function setChangeInGovernmentalFundRevenueMaxRank($changeInGovernmentalFundRevenueMaxRank)
    {
        $this->changeInGovernmentalFundRevenueMaxRank = $changeInGovernmentalFundRevenueMaxRank;

        return $this;
    }

    /**
     * Get changeInGovernmentalFundRevenueMaxRank
     *
     * @return integer
     */
    public function getChangeInGovernmentalFundRevenueMaxRank()
    {
        return $this->changeInGovernmentalFundRevenueMaxRank;
    }

    /**
     * Set defaultProbabilityMaxRank
     *
     * @param integer $defaultProbabilityMaxRank
     * @return MaxRank
     */
    public function setDefaultProbabilityMaxRank($defaultProbabilityMaxRank)
    {
        $this->defaultProbabilityMaxRank = $defaultProbabilityMaxRank;

        return $this;
    }

    /**
     * Get defaultProbabilityMaxRank
     *
     * @return integer
     */
    public function getDefaultProbabilityMaxRank()
    {
        return $this->defaultProbabilityMaxRank;
    }

    /**
     * Set publicSafetyExpOverTotGovFundRevenueMaxRank
     *
     * @param integer $publicSafetyExpOverTotGovFundRevenueMaxRank
     * @return MaxRank
     */
    public function setPublicSafetyExpOverTotGovFundRevenueMaxRank($publicSafetyExpOverTotGovFundRevenueMaxRank)
    {
        $this->publicSafetyExpOverTotGovFundRevenueMaxRank = $publicSafetyExpOverTotGovFundRevenueMaxRank;

        return $this;
    }

    /**
     * Get publicSafetyExpOverTotGovFundRevenueMaxRank
     *
     * @return integer
     */
    public function getPublicSafetyExpOverTotGovFundRevenueMaxRank()
    {
        return $this->publicSafetyExpOverTotGovFundRevenueMaxRank;
    }

    /**
     * Set publicSafetyExpOverGeneralFundRevenueMaxRank
     *
     * @param integer $publicSafetyExpOverGeneralFundRevenueMaxRank
     * @return MaxRank
     */
    public function setPublicSafetyExpOverGeneralFundRevenueMaxRank($publicSafetyExpOverGeneralFundRevenueMaxRank)
    {
        $this->publicSafetyExpOverGeneralFundRevenueMaxRank = $publicSafetyExpOverGeneralFundRevenueMaxRank;

        return $this;
    }

    /**
     * Get publicSafetyExpOverGeneralFundRevenueMaxRank
     *
     * @return integer
     */
    public function getPublicSafetyExpOverGeneralFundRevenueMaxRank()
    {
        return $this->publicSafetyExpOverGeneralFundRevenueMaxRank;
    }

    /**
     * Set totalRevenuePerCapitaMaxRank
     *
     * @param integer $totalRevenuePerCapitaMaxRank
     * @return MaxRank
     */
    public function setTotalRevenuePerCapitaMaxRank($totalRevenuePerCapitaMaxRank)
    {
        $this->totalRevenuePerCapitaMaxRank = $totalRevenuePerCapitaMaxRank;

        return $this;
    }

    /**
     * Get totalRevenuePerCapitaMaxRank
     *
     * @return integer
     */
    public function getTotalRevenuePerCapitaMaxRank()
    {
        return $this->totalRevenuePerCapitaMaxRank;
    }

    /**
     * Set totalExpendituresPerCapitaMaxRank
     *
     * @param integer $totalExpendituresPerCapitaMaxRank
     * @return MaxRank
     */
    public function setTotalExpendituresPerCapitaMaxRank($totalExpendituresPerCapitaMaxRank)
    {
        $this->totalExpendituresPerCapitaMaxRank = $totalExpendituresPerCapitaMaxRank;

        return $this;
    }

    /**
     * Get totalExpendituresPerCapitaMaxRank
     *
     * @return integer
     */
    public function getTotalExpendituresPerCapitaMaxRank()
    {
        return $this->totalExpendituresPerCapitaMaxRank;
    }

    /**
     * Set medianTotalCompGeneralPublicMaxRank
     *
     * @param integer $medianTotalCompGeneralPublicMaxRank
     * @return MaxRank
     */
    public function setMedianTotalCompGeneralPublicMaxRank($medianTotalCompGeneralPublicMaxRank)
    {
        $this->medianTotalCompGeneralPublicMaxRank = $medianTotalCompGeneralPublicMaxRank;

        return $this;
    }

    /**
     * Get medianTotalCompGeneralPublicMaxRank
     *
     * @return integer
     */
    public function getMedianTotalCompGeneralPublicMaxRank()
    {
        return $this->medianTotalCompGeneralPublicMaxRank;
    }

    /**
     * Set medianHomePriceMaxRank
     *
     * @param integer $medianHomePriceMaxRank
     * @return MaxRank
     */
    public function setMedianHomePriceMaxRank($medianHomePriceMaxRank)
    {
        $this->medianHomePriceMaxRank = $medianHomePriceMaxRank;

        return $this;
    }

    /**
     * Get medianHomePriceMaxRank
     *
     * @return integer
     */
    public function getMedianHomePriceMaxRank()
    {
        return $this->medianHomePriceMaxRank;
    }

    /**
     * Set populationMaxRank
     *
     * @param integer $populationMaxRank
     * @return MaxRank
     */
    public function setPopulationMaxRank($populationMaxRank)
    {
        $this->populationMaxRank = $populationMaxRank;

        return $this;
    }

    /**
     * Get populationMaxRank
     *
     * @return integer
     */
    public function getPopulationMaxRank()
    {
        return $this->populationMaxRank;
    }

    /**
     * Set enrollmentMaxRank
     *
     * @param integer $enrollmentMaxRank
     * @return MaxRank
     */
    public function setEnrollmentMaxRank($enrollmentMaxRank)
    {
        $this->enrollmentMaxRank = $enrollmentMaxRank;

        return $this;
    }

    /**
     * Get enrollmentMaxRank
     *
     * @return integer
     */
    public function getEnrollmentMaxRank()
    {
        return $this->enrollmentMaxRank;
    }
}
