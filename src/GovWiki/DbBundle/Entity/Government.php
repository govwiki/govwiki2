<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation\ExclusionPolicy;
use JMS\Serializer\Annotation\MaxDepth;
use JMS\Serializer\Annotation\SerializedName;
use JMS\Serializer\Annotation\VirtualProperty;
use JMS\Serializer\Annotation\Groups;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;

/**
 * Government
 *
 * @ORM\Table(name="governments")
 * @ORM\Entity(repositoryClass="GovWiki\DbBundle\Entity\Repository\GovernmentRepository")
 * @ExclusionPolicy("none")
 *
 * @UniqueEntity("name")
 */
class Government
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     * @Groups({"government", "government_list", "elected_official", "map"})
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="state_id", type="string", length=255, nullable=true)
     * @Groups({"government", "elected_official"})
     */
    private $stateId;

    /**
     * @ORM\OneToMany(
     *  targetEntity="ElectedOfficial",
     *  mappedBy="government",
     *  cascade={"remove"}
     * )
     * @MaxDepth(2)
     * @Groups({"government"})
     */
    private $electedOfficials;

    /**
     * @ORM\OneToMany(
     *  targetEntity="Legislation",
     *  mappedBy="government",
     *  cascade={"remove"}
     * )
     */
    private $legislations;

    /**
     * @ORM\OneToMany(
     *  targetEntity="FinData",
     *  mappedBy="government",
     *  cascade={"remove"}
     * )
     * @Groups({"government"})
     */
    private $finData;

    /**
     * @var string
     *
     * @ORM\Column(name="name", type="string", length=255, nullable=true)
     * @Groups({"government", "government_list"})
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column(name="slug", type="string", length=255, nullable=true)
     * @Groups({"government", "government_list", "elected_official", "map"})
     */
    private $slug;

    /**
     * @var string
     *
     * @ORM\Column(name="special_district_function_code", type="string", length=255, nullable=true)
     * @Groups({"government"})
     */
    private $specialDistrictFunctionCode;

    /**
     * @var string
     *
     * @ORM\Column(name="pavement_condition_index_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $pavementConditionIndexRank;

    /**
     * @var string
     *
     * @ORM\Column(name="type", type="string", length=255, nullable=true)
     * @Groups({"government", "government_list"})
     */
    private $type;

    /**
     * @var string
     *
     * @ORM\Column(name="alt_type", type="string", length=20, nullable=true)
     * @Groups({"government", "government_list"})
     */
    private $altType;

    /**
     * @var string
     *
     * @ORM\Column(name="alt_type_slug", type="string", length=20, nullable=true)
     * @Groups({"government", "elected_official", "map"})
     */
    private $altTypeSlug;

    /**
     * @var string
     *
     * @ORM\Column(name="census_contact", type="string", length=255, nullable=true)
     * @Groups({"government"})
     */
    private $censusContact;

    /**
     * @var string
     *
     * @ORM\Column(name="city", type="string", length=255, nullable=true)
     * @Groups({"government", "elected_official"})
     */
    private $city;

    /**
     * @var string
     *
     * @ORM\Column(name="state", type="string", length=50, nullable=true)
     * @Groups({"government"})
     */
    private $state;

    /**
     * @var string
     *
     * @ORM\Column(name="zip", type="string", length=50, nullable=true)
     * @Groups({"government"})
     */
    private $zip;

    /**
     * @var string
     *
     * @ORM\Column(name="web_site", type="string", length=255, nullable=true)
     * @Groups({"government"})
     */
    private $webSite;

    /**
     * @var float
     *
     * @ORM\Column(name="population", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $population;

    /**
     * @var float
     *
     * @ORM\Column(name="population_as_of_year", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $populationAsOfYear;

    /**
     * @var string
     *
     * @ORM\Column(name="enrollment", type="string", length=50, nullable=true)
     * @Groups({"government"})
     */
    private $enrollment;

    /**
     * @var string
     *
     * @ORM\Column(name="enrollment_as_of_year", type="string", length=50, nullable=true)
     * @Groups({"government"})
     */
    private $enrollmentAsOfYear;

    /**
     * @var float
     *
     * @ORM\Column(name="frpm_rate", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $frpmRate;

    /**
     * @var integer
     *
     * @ORM\Column(name="fips_county", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $fipsCounty;

    /**
     * @var integer
     *
     * @ORM\Column(name="fips_place", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $fipsPlace;

    /**
     * @var string
     *
     * @ORM\Column(name="county_area_name", type="text", nullable=true)
     * @Groups({"government"})
     */
    private $countyAreaName;

    /**
     * @var float
     *
     * @ORM\Column(name="latitude", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government", "map"})
     */
    private $latitude;

    /**
     * @var float
     *
     * @ORM\Column(name="longitude", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government", "map"})
     */
    private $longitude;

    /**
     * @var float
     *
     * @ORM\Column(name="rand", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $rand;

    /**
     * @var float
     *
     * @ORM\Column(name="median_wages_general_public", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $medianWagesGeneralPublic;

    /**
     * @var float
     *
     * @ORM\Column(name="median_benefits_general_public", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $medianBenefitsGeneralPublic;

    /**
     * @var float
     *
     * @ORM\Column(name="median_total_comp_general_public", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $medianTotalCompGeneralPublic;

    /**
     * @var float
     *
     * @ORM\Column(name="median_home_price", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $medianHomePrice;

    /**
     * @var float
     *
     * @ORM\Column(name="median_salary_per_full_time_emp", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $medianSalaryPerFullTimeEmp;

    /**
     * @var float
     *
     * @ORM\Column(name="median_benefits_per_ft_emp", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $medianBenefitsPerFtEmp;

    /**
     * @var float
     *
     * @ORM\Column(name="median_total_comp_per_ft_emp", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $medianTotalCompPerFtEmp;

    /**
     * @var float
     *
     * @ORM\Column(name="median_total_comp_over_median_individual_comp", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $medianTotalCompOverMedianIndividualComp;

    /**
     * @var string
     *
     * @ORM\Column(name="name_of_highest_paid_employee", type="text", nullable=true)
     * @Groups({"government"})
     */
    private $nameOfHighestPaidEmployee;

    /**
     * @var string
     *
     * @ORM\Column(name="title_of_highest_paid_employee", type="text", nullable=true)
     * @Groups({"government"})
     */
    private $titleOfHighestPaidEmployee;

    /**
     * @var float
     *
     * @ORM\Column(name="total_comp_for_highest_paid_emp", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $totalCompForHighestPaidEmp;

    /**
     * @var float
     *
     * @ORM\Column(name="number_of_full_time_employees", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $numberOfFullTimeEmployees;

    /**
     * @var float
     *
     * @ORM\Column(name="full_time_employees_over_population", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $fullTimeEmployeesOverPopulation;

    /**
     * @var float
     *
     * @ORM\Column(name="total_wages", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $totalWages;

    /**
     * @var float
     *
     * @ORM\Column(name="total_salaries_plus_benefits", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $totalSalariesPlusBenefits;

    /**
     * @var float
     *
     * @ORM\Column(name="pension_contribution", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $pensionContribution;

    /**
     * @var float
     *
     * @ORM\Column(name="pension_uaal", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $pensionUaal;

    /**
     * @var float
     *
     * @ORM\Column(name="median_pension_30_year_retiree", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $medianPension30YearRetiree;

    /**
     * @var float
     *
     * @ORM\Column(name="pension_contribution_over_total_revenue", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $pensionContributionOverTotalRevenue;

    /**
     * @var string
     *
     * @ORM\Column(name="former_emp_with_largest_pension", type="text", nullable=true)
     * @Groups({"government"})
     */
    private $formerEmpWithLargestPension;

    /**
     * @var float
     *
     * @ORM\Column(name="amount_of_largest_pension", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $amountOfLargestPension;

    /**
     * @var float
     *
     * @ORM\Column(name="opeb_arc", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $opebArc;

    /**
     * @var float
     *
     * @ORM\Column(name="opeb_actual_contribution", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $opebActualContribution;

    /**
     * @var float
     *
     * @ORM\Column(name="opeb_uaal", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $opebUaal;

    /**
     * @var float
     *
     * @ORM\Column(name="opeb_arc_over_total_revenue", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $opebArcOverTotalRevenue;

    /**
     * @var float
     *
     * @ORM\Column(name="pension_plus_opeb_arc_over_tot_rev", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $pensionPlusOpebArcOverTotRev;

    /**
     * @var float
     *
     * @ORM\Column(name="academic_performance_index", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $academicPerformanceIndex;

    /**
     * @var float
     *
     * @ORM\Column(name="sat_scores", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $satScores;

    /**
     * @var string
     *
     * @ORM\Column(name="parent_trigger_eligible_schools", type="text", nullable=true)
     * @Groups({"government"})
     */
    private $parentTriggerEligibleSchools;

    /**
     * @var string
     *
     * @ORM\Column(name="open_enrollment_schools", type="text", nullable=true)
     * @Groups({"government"})
     */
    private $openEnrollmentSchools;

    /**
     * @var float
     *
     * @ORM\Column(name="violent_crimes_per_100000_population", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $violentCrimesPer100000Population;

    /**
     * @var float
     *
     * @ORM\Column(name="property_crimes_per_100000_population", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $propertyCrimesPer100000Population;

    /**
     * @var float
     *
     * @ORM\Column(name="pavement_condition_index", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $pavementConditionIndex;

    /**
     * @var float
     *
     * @ORM\Column(name="sales_tax_rate", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $salesTaxRate;

    /**
     * @var float
     *
     * @ORM\Column(name="library_hours_per_week", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $libraryHoursPerWeek;

    /**
     * @var float
     *
     * @ORM\Column(name="graduation_rate", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $graduationRate;

    /**
     * @var float
     *
     * @ORM\Column(name="dropout_rate", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $dropoutRate;

    /**
     * @var float
     *
     * @ORM\Column(name="public_safety_exp_over_tot_gov_fund_revenue", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $publicSafetyExpOverTotGovFundRevenue;

    /**
     * @var float
     *
     * @ORM\Column(name="public_safety_exp_over_general_fund_revenue", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $publicSafetyExpOverGeneralFundRevenue;

    /**
     * @var float
     *
     * @ORM\Column(name="general_fund_balance_over_general_fund_exp", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $generalFundBalanceOverGeneralFundExp;

    /**
     * @var float
     *
     * @ORM\Column(name="total_debt_over_total_revenue", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $totalDebtOverTotalRevenue;

    /**
     * @var float
     *
     * @ORM\Column(name="default_probability", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $defaultProbability;

    /**
     * @var float
     *
     * @ORM\Column(name="total_governmental_fund_revenues", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $totalGovernmentalFundRevenues;

    /**
     * @var float
     *
     * @ORM\Column(name="total_revenue", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $totalRevenue;

    /**
     * @var float
     *
     * @ORM\Column(name="total_revenue_per_capita", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $totalRevenuePerCapita;

    /**
     * @var float
     *
     * @ORM\Column(name="total_governmental_fund_expenditures", type="float", precision=10, scale=0, nullable=true)
      * @Groups({"government"})
     */
    private $totalGovernmentalFundExpenditures;

    /**
     * @var float
     *
     * @ORM\Column(name="total_expenditures", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $totalExpenditures;

    /**
     * @var float
     *
     * @ORM\Column(name="total_expenditures_per_capita", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $totalExpendituresPerCapita;

    /**
     * @var float
     *
     * @ORM\Column(name="expenditure_per_student", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $expenditurePerStudent;

    /**
     * @var float
     *
     * @ORM\Column(name="gf_surplus_over_gf_revenue", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $gfSurplusOverGfRevenue;

    /**
     * @var float
     *
     * @ORM\Column(name="change_in_governmental_fund_revenue", type="float", precision=10, scale=0, nullable=true)
     * @Groups({"government"})
     */
    private $changeInGovernmentalFundRevenue;

    /**
     * @var integer
     *
     * @ORM\Column(name="inc_id", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $incId;

    /**
     * @var string
     *
     * @ORM\Column(name="wikipedia_page_name", type="string", length=255, nullable=true)
     * @Groups({"government"})
     */
    private $wikipediaPageName;

    /**
     * @var integer
     *
     * @ORM\Column(name="wikipedia_page_exists", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $wikipediaPageExists;

    /**
     * @var string
     *
     * @ORM\Column(name="transparent_california_page_name", type="string", length=255, nullable=true)
     * @Groups({"government"})
     */
    private $transparentCaliforniaPageName;

    /**
     * @var string
     *
     * @ORM\Column(name="latest_audit_url", type="string", length=255, nullable=true)
     * @Groups({"government"})
     */
    private $latestAuditUrl;

    /**
     * @var integer
     *
     * @ORM\Column(name="frpm_rate_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $frpmRateRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="median_salary_per_full_time_emp_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $medianSalaryPerFullTimeEmpRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="median_benefits_per_ft_emp_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $medianBenefitsPerFtEmpRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="median_total_comp_per_ft_emp_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $medianTotalCompPerFtEmpRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="median_total_comp_over_median_individual_comp_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $medianTotalCompOverMedianIndividualCompRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="total_comp_for_highest_paid_emp_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $totalCompForHighestPaidEmpRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="full_time_employees_over_population_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $fullTimeEmployeesOverPopulationRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="pension_contribution_over_total_revenue_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $pensionContributionOverTotalRevenueRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="opeb_arc_over_total_revenue_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $opebArcOverTotalRevenueRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="pension_plus_opeb_arc_over_tot_rev_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $pensionPlusOpebArcOverTotRevRank;

    /**
     * @var integer
     *
     * @SerializedName("violent_crimes_per_100000_population_rank")
     * @Groups({"government"})
     * @ORM\Column(name="violent_crimes_per_100000_population_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $violentCrimesPer100000PopulationRank;

    /**
     * @var integer
     *
     * @SerializedName("property_crimes_per_100000_population_rank")
     * @Groups({"government"})
     * @ORM\Column(name="property_crimes_per_100000_population_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $propertyCrimesPer100000PopulationRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="academic_performance_index_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $academicPerformanceIndexRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="sat_scores_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $satScoresRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="sales_tax_rate_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $salesTaxRateRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="library_hours_per_week_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $libraryHoursPerWeekRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="graduation_rate_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $graduationRateRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="dropout_rate_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $dropoutRateRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="total_debt_over_total_revenue_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $totalDebtOverTotalRevenueRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="expenditure_per_student_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $expenditurePerStudentRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="general_fund_balance_over_general_fund_exp_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $generalFundBalanceOverGeneralFundExpRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="gf_surplus_over_gf_revenue_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $gfSurplusOverGfRevenueRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="change_in_governmental_fund_revenue_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $changeInGovernmentalFundRevenueRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="default_probability_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $defaultProbabilityRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="public_safety_exp_over_tot_gov_fund_revenue_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $publicSafetyExpOverTotGovFundRevenueRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="public_safety_exp_over_general_fund_revenue_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $publicSafetyExpOverGeneralFundRevenueRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="total_revenue_per_capita_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $totalRevenuePerCapitaRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="total_expenditures_per_capita_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $totalExpendituresPerCapitaRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="median_total_comp_general_public_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $medianTotalCompGeneralPublicRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="median_home_price_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $medianHomePriceRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="population_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $populationRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="enrollment_rank", type="integer", nullable=true)
     * @Groups({"government"})
     */
    private $enrollmentRank;

    /**
     * @var array
     * @Groups({"government"})
     */
    private $maxRanks;

    /**
     * @var array
     * @Groups({"government"})
     */
    private $financialStatements;

    /**
     * @var Map
     *
     * @ORM\ManyToOne(targetEntity="Environment", inversedBy="governments")
     * @ORM\JoinColumn(name="environment_id")
     */
    private $environment;

    /**
     * @var float
     *
     * @ORM\Column(name="sq_miles", type="float", precision=10, scale=0, nullable=true)
     */
    private $sqMiles;

    /**
     * @var float
     *
     * @ORM\Column(name="number_of_employees", type="float", precision=10, scale=0, nullable=true)
     */
    private $numberOfEmployees;

    /**
     * @var float
     *
     * @ORM\Column(name="unemployment_rate", type="float", precision=10, scale=0, nullable=true)
     */
    private $unemploymentRate;

    /**
     * @var float
     *
     * @ORM\Column(name="annual_salary_mayor", type="float", precision=10, scale=0, nullable=true)
     */
    private $annualSalaryMayor;

    /**
     * @var string
     *
     * @ORM\Column(name="mayor_name", type="string", length=255, nullable=true)
     */
    private $mayorName;

    /**
     * @var integer
     *
     * @ORM\Column(name="years_mayor_in_office", type="integer", nullable=true)
     */
    private $yearsMayorInOffice;

    /**
     * @var float
     *
     * @ORM\Column(name="current_assets", type="float", precision=10, scale=0, nullable=true)
     */
    private $currentAssets;

    /**
     * @var float
     *
     * @ORM\Column(name="current_liabilities", type="float", precision=10, scale=0, nullable=true)
     */
    private $currentLiabilities;

    /**
     * @var float
     *
     * @ORM\Column(name="long_term_debt", type="float", precision=10, scale=0, nullable=true)
     */
    private $longTermDebt;

    /**
     * @var float
     *
     * @ORM\Column(name="total_assets", type="float", precision=10, scale=0, nullable=true)
     */
    private $totalAssets;

    /**
     * @var float
     *
     * @ORM\Column(name="total_net_position", type="float", precision=10, scale=0, nullable=true)
     */
    private $totalNetPosition;

    /**
     * @var float
     *
     * @ORM\Column(name="total_unrestricted_net_position", type="float", precision=10, scale=0, nullable=true)
     */
    private $totalUnrestrictedNetPosition;

    /**
     * @var float
     *
     * @ORM\Column(name="general_revenues", type="float", precision=10, scale=0, nullable=true)
     */
    private $generalRevenues;

    /**
     * @var float
     *
     * @ORM\Column(name="change_in_net_assets", type="float", precision=10, scale=0, nullable=true)
     */
    private $changeInNetAssets;

    /**
     * @var float
     *
     * @ORM\Column(name="general_fund_revenues", type="float", precision=10, scale=0, nullable=true)
     */
    private $generalFundRevenues;

    /**
     * @var float
     *
     * @ORM\Column(name="governmental_fund_expenditures", type="float", precision=10, scale=0, nullable=true)
     */
    private $governmentalFundExpenditures;

    /**
     * @var float
     *
     * @ORM\Column(name="general_fund_surplus", type="float", precision=10, scale=0, nullable=true)
     */
    private $generalFundSurplus;

    /**
     * @var float
     *
     * @ORM\Column(name="net_change_in_general_fund_balance", type="float", precision=10, scale=0, nullable=true)
     */
    private $netChangeInGeneralFundBalance;

    /**
     * @var float
     *
     * @ORM\Column(name="general_fund_balance", type="float", precision=10, scale=0, nullable=true)
     */
    private $generalFundBalance;

    /**
     * @var float
     *
     * @ORM\Column(name="debt_service_expenditures_all_funds", type="float", precision=10, scale=0, nullable=true)
     */
    private $debtServiceExpendituresAllFunds;

    /**
     * @var float
     *
     * @ORM\Column(name="intergovernmental_funds_gf", type="float", precision=10, scale=0, nullable=true)
     */
    private $intergovernmentalFundsGf;

    /**
     * @var float
     *
     * @ORM\Column(name="government_funds_overall_balance", type="float", precision=10, scale=0, nullable=true)
     */
    private $governmentFundsOverallBalance;

    /**
     * @var float
     *
     * @ORM\Column(name="net_change_in_fund_balance_over_general_fund_revenue", type="float", precision=10, scale=0, nullable=true)
     */
    private $netChangeInFundBalanceOverGeneralFundRevenue;

    /**
     * @var integer
     *
     * @ORM\Column(name="net_change_in_fund_balance_over_general_fund_revenue_rank", type="integer", nullable=true)
     */
    private $netChangeInFundBalanceOverGeneralFundRevenueRank;

    /**
     * @var float
     *
     * @ORM\Column(name="general_fund_balance_over_general_fund_expenditures", type="float", precision=10, scale=0, nullable=true)
     */
    private $generalFundBalanceOverGeneralFundExpenditures;

    /**
     * @var integer
     *
     * @ORM\Column(name="general_fund_balance_over_general_fund_expenditures_rank", type="integer", nullable=true)
     */
    private $generalFundBalanceOverGeneralFundExpendituresRank;

    /**
     * @var float
     *
     * @ORM\Column(name="current_assets_per_capita", type="float", precision=10, scale=0, nullable=true)
     */
    private $currentAssetsPerCapita;

    /**
     * @var integer
     *
     * @ORM\Column(name="current_assets_per_capita_rank", type="integer", nullable=true)
     */
    private $currentAssetsPerCapitaRank;

    /**
     * @var float
     *
     * @ORM\Column(name="current_assets_over_current_liabilities", type="float", precision=10, scale=0, nullable=true)
     */
    private $currentAssetsOverCurrentLiabilities;

    /**
     * @var integer
     *
     * @ORM\Column(name="current_assets_over_current_liabilities_rank", type="integer", nullable=true)
     */
    private $currentAssetsOverCurrentLiabilitiesRank;

    /**
     * @var float
     *
     * @ORM\Column(name="long_term_debt_over_capita", type="float", precision=10, scale=0, nullable=true)
     */
    private $longTermDebtOverCapita;

    /**
     * @var integer
     *
     * @ORM\Column(name="long_term_debt_over_capita_rank", type="integer", nullable=true)
     */
    private $longTermDebtOverCapitaRank;

    /**
     * @var float
     *
     * @ORM\Column(name="general_revenues_over_long_term_debt", type="float", precision=10, scale=0, nullable=true)
     */
    private $generalRevenuesOverLongTermDebt;

    /**
     * @var integer
     *
     * @ORM\Column(name="general_revenues_over_long_term_debt_rank", type="integer", nullable=true)
     */
    private $generalRevenuesOverLongTermDebtRank;

    /**
     * @var float
     *
     * @ORM\Column(name="debt_service_expenditures_over_general_fund_revenues", type="float", precision=10, scale=0, nullable=true)
     */
    private $debtServiceExpendituresOverGeneralFundRevenues;

    /**
     * @var integer
     *
     * @ORM\Column(name="debt_service_expenditures_over_general_fund_revenues_rank", type="integer", nullable=true)
     */
    private $debtServiceExpendituresOverGeneralFundRevenuesRank;

    /**
     * @var float
     *
     * @ORM\Column(name="general_fund_surplus_over_revenues", type="float", precision=10, scale=0, nullable=true)
     */
    private $generalFundSurplusOverRevenues;

    /**
     * @var integer
     *
     * @ORM\Column(name="general_fund_surplus_over_revenues_rank", type="integer", nullable=true)
     */
    private $generalFundSurplusOverRevenuesRank;

    /**
     * @var float
     *
     * @ORM\Column(name="change_in_net_assets_over_general_fund_revenues", type="float", precision=10, scale=0, nullable=true)
     */
    private $changeInNetAssetsOverGeneralFundRevenues;

    /**
     * @var integer
     *
     * @ORM\Column(name="change_in_net_assets_over_general_fund_revenues_rank", type="integer", nullable=true)
     */
    private $changeInNetAssetsOverGeneralFundRevenuesRank;

    /**
     * @var float
     *
     * @ORM\Column(name="government_funds_overall_balance_per_capita", type="float", precision=10, scale=0, nullable=true)
     */
    private $governmentFundsOverallBalancePerCapita;

    /**
     * @var integer
     *
     * @ORM\Column(name="government_funds_overall_balance_per_capita_rank", type="integer", nullable=true)
     */
    private $governmentFundsOverallBalancePerCapitaRank;

    /**
     * @var float
     *
     * @ORM\Column(name="overall_governmental_fund_balance_over_long_term_liabs", type="float", precision=10, scale=0, nullable=true)
     */
    private $overallGovernmentalFundBalanceOverLongTermLiabs;

    /**
     * @var integer
     *
     * @ORM\Column(name="overall_governmental_fund_balance_over_long_term_liabs_rank", type="integer", nullable=true)
     */
    private $overallGovernmentalFundBalanceOverLongTermLiabsRank;

    /**
     * @var float
     *
     * @ORM\Column(name="intergovermental_revenues_over_general_fund_revenues", type="float", precision=10, scale=0, nullable=true)
     */
    private $intergovermentalRevenuesOverGeneralFundRevenues;

    /**
     * @var integer
     *
     * @ORM\Column(name="intergovermental_revenues_over_general_fund_revenues_rank", type="integer", nullable=true)
     */
    private $intergovermentalRevenuesOverGeneralFundRevenuesRank;

    /**
     * @var float
     *
     * @ORM\Column(name="total_unrestricted_net_position_over_total_assets", type="float", precision=10, scale=0, nullable=true)
     */
    private $totalUnrestrictedNetPositionOverTotalAssets;

    /**
     * @var integer
     *
     * @ORM\Column(name="total_unrestricted_net_position_over_total_assets_rank", type="integer", nullable=true)
     */
    private $totalUnrestrictedNetPositionOverTotalAssetsRank;

    /**
     * @var integer
     *
     * @ORM\Column(name="overall_weighted_index_rank", type="integer", nullable=true)
     */
    private $overallWeightedIndexRank;

    /**
     * @var string
     *
     * @ORM\Column(name="legend_overall_ranking", type="string", length=10, nullable=true)
     */
    private $legendOverallRanking;

    /**
     * @return array
     * @VirtualProperty()
     */
    public function getMaxRanks()
    {
        return $this->maxRanks;
    }

    /**
     * @param array $maxRanks
     */
    public function setMaxRanks($maxRanks)
    {
        $this->maxRanks = $maxRanks;
    }

    /**
     * @return array
     * @VirtualProperty()
     */
    public function getFinancialStatements()
    {
        return $this->financialStatements;
    }

    /**
     * @param array $financialStatements
     */
    public function setFinancialStatements($financialStatements)
    {
        $this->financialStatements = $financialStatements;
    }

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->electedOfficials = new \Doctrine\Common\Collections\ArrayCollection();
        $this->finData          = new \Doctrine\Common\Collections\ArrayCollection();
        $this->legislations     = new \Doctrine\Common\Collections\ArrayCollection();
    }

    /**
     * To string
     *
     * @return string
     */
    public function __toString()
    {
        return $this->name;
    }

    /**
     * Set id
     *
     * @param int $id
     * @return Government
     */
    public function setId($id)
    {
        $this->id = $id;

        return $this;
    }

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
     * Set stateId
     *
     * @param string $stateId
     * @return Government
     */
    public function setStateId($stateId)
    {
        $this->stateId = $stateId;

        return $this;
    }

    /**
     * Get stateId
     *
     * @return string
     */
    public function getStateId()
    {
        return $this->stateId;
    }

    /**
     * Add electedOfficials
     *
     * @param \GovWiki\DbBundle\Entity\ElectedOfficial $electedOfficials
     * @return Government
     */
    public function addElectedOfficial(\GovWiki\DbBundle\Entity\ElectedOfficial $electedOfficials)
    {
        $this->electedOfficials[] = $electedOfficials;

        return $this;
    }

    /**
     * Remove electedOfficials
     *
     * @param \GovWiki\DbBundle\Entity\ElectedOfficial $electedOfficials
     */
    public function removeElectedOfficial(\GovWiki\DbBundle\Entity\ElectedOfficial $electedOfficials)
    {
        $this->electedOfficials->removeElement($electedOfficials);
    }

    /**
     * Get electedOfficials
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getElectedOfficials()
    {
        return $this->electedOfficials;
    }

    /**
     * Add finData
     *
     * @param \GovWiki\DbBundle\Entity\FinData $finData
     * @return Government
     */
    public function addFinDatum(\GovWiki\DbBundle\Entity\FinData $finData)
    {
        $this->finData[] = $finData;

        return $this;
    }

    /**
     * Remove finData
     *
     * @param \GovWiki\DbBundle\Entity\FinData $finData
     */
    public function removeFinDatum(\GovWiki\DbBundle\Entity\FinData $finData)
    {
        $this->finData->removeElement($finData);
    }

    /**
     * Get finData
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getFinData()
    {
        return $this->finData;
    }

    /**
     * Add legislations
     *
     * @param \GovWiki\DbBundle\Entity\Legislation $legislations
     * @return Government
     */
    public function addLegislation(\GovWiki\DbBundle\Entity\Legislation $legislations)
    {
        $this->legislations[] = $legislations;

        return $this;
    }

    /**
     * Remove legislations
     *
     * @param \GovWiki\DbBundle\Entity\Legislation $legislations
     */
    public function removeLegislation(\GovWiki\DbBundle\Entity\Legislation $legislations)
    {
        $this->legislations->removeElement($legislations);
    }

    /**
     * Get legislations
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getLegislations()
    {
        return $this->legislations;
    }

    /**
     * Set name
     *
     * @param string $name
     *
     * @return Government
     */
    public function setName($name)
    {
        $this->name = $name;
        $this->slug = str_replace([' ', '-'], '_', ucwords(strtolower($name)));

        return $this;
    }

    /**
     * Get name
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Set slug
     *
     * @param string $slug
     * @return Government
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;

        return $this;
    }

    /**
     * Get slug
     *
     * @return string
     */
    public function getSlug()
    {
        return $this->slug;
    }

    /**
     * Set specialDistrictFunctionCode
     *
     * @param string $specialDistrictFunctionCode
     * @return Government
     */
    public function setSpecialDistrictFunctionCode($specialDistrictFunctionCode)
    {
        $this->specialDistrictFunctionCode = $specialDistrictFunctionCode;

        return $this;
    }

    /**
     * Get specialDistrictFunctionCode
     *
     * @return string
     */
    public function getSpecialDistrictFunctionCode()
    {
        return $this->specialDistrictFunctionCode;
    }

    /**
     * Set type
     *
     * @param string $type
     * @return Government
     */
    public function setType($type)
    {
        $this->type = $type;

        return $this;
    }

    /**
     * Get type
     *
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * Set altType
     *
     * @param string $altType
     * @return Government
     */
    public function setAltType($altType)
    {
        $this->altType     = $altType;
        $this->altTypeSlug = str_replace(' ', '_', ucwords(strtolower($altType)));

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
     * Set altTypeSlug
     *
     * @param string $altTypeSlug
     * @return Government
     */
    public function setAltTypeSlug($altTypeSlug)
    {
        $this->altTypeSlug = $altTypeSlug;

        return $this;
    }

    /**
     * Get altTypeSlug
     *
     * @return string
     */
    public function getAltTypeSlug()
    {
        return $this->altTypeSlug;
    }

    /**
     * Set censusContact
     *
     * @param string $censusContact
     * @return Government
     */
    public function setCensusContact($censusContact)
    {
        $this->censusContact = $censusContact;

        return $this;
    }

    /**
     * Get censusContact
     *
     * @return string
     */
    public function getCensusContact()
    {
        return $this->censusContact;
    }

    /**
     * Set city
     *
     * @param string $city
     * @return Government
     */
    public function setCity($city)
    {
        $this->city = $city;

        return $this;
    }

    /**
     * Get city
     *
     * @return string
     */
    public function getCity()
    {
        return $this->city;
    }

    /**
     * Set state
     *
     * @param string $state
     * @return Government
     */
    public function setState($state)
    {
        $this->state = $state;

        return $this;
    }

    /**
     * Get state
     *
     * @return string
     */
    public function getState()
    {
        return $this->state;
    }

    /**
     * Set zip
     *
     * @param string $zip
     * @return Government
     */
    public function setZip($zip)
    {
        $this->zip = $zip;

        return $this;
    }

    /**
     * Get zip
     *
     * @return string
     */
    public function getZip()
    {
        return $this->zip;
    }

    /**
     * Set webSite
     *
     * @param string $webSite
     * @return Government
     */
    public function setWebSite($webSite)
    {
        $this->webSite = $webSite;

        return $this;
    }

    /**
     * Get webSite
     *
     * @return string
     */
    public function getWebSite()
    {
        return $this->webSite;
    }

    /**
     * Set population
     *
     * @param float $population
     * @return Government
     */
    public function setPopulation($population)
    {
        $this->population = $population;

        return $this;
    }

    /**
     * Get population
     *
     * @return float
     */
    public function getPopulation()
    {
        return $this->population;
    }

    /**
     * Set populationAsOfYear
     *
     * @param float $populationAsOfYear
     * @return Government
     */
    public function setPopulationAsOfYear($populationAsOfYear)
    {
        $this->populationAsOfYear = $populationAsOfYear;

        return $this;
    }

    /**
     * Get populationAsOfYear
     *
     * @return float
     */
    public function getPopulationAsOfYear()
    {
        return $this->populationAsOfYear;
    }

    /**
     * Set enrollment
     *
     * @param string $enrollment
     * @return Government
     */
    public function setEnrollment($enrollment)
    {
        $this->enrollment = $enrollment;

        return $this;
    }

    /**
     * Get enrollment
     *
     * @return string
     */
    public function getEnrollment()
    {
        return $this->enrollment;
    }

    /**
     * Set enrollmentAsOfYear
     *
     * @param string $enrollmentAsOfYear
     * @return Government
     */
    public function setEnrollmentAsOfYear($enrollmentAsOfYear)
    {
        $this->enrollmentAsOfYear = $enrollmentAsOfYear;

        return $this;
    }

    /**
     * Get enrollmentAsOfYear
     *
     * @return string
     */
    public function getEnrollmentAsOfYear()
    {
        return $this->enrollmentAsOfYear;
    }

    /**
     * Set frpmRate
     *
     * @param float $frpmRate
     * @return Government
     */
    public function setFrpmRate($frpmRate)
    {
        $this->frpmRate = $frpmRate;

        return $this;
    }

    /**
     * Get frpmRate
     *
     * @return float
     */
    public function getFrpmRate()
    {
        return $this->frpmRate;
    }

    /**
     * Set fipsCounty
     *
     * @param integer $fipsCounty
     * @return Government
     */
    public function setFipsCounty($fipsCounty)
    {
        $this->fipsCounty = $fipsCounty;

        return $this;
    }

    /**
     * Get fipsCounty
     *
     * @return integer
     */
    public function getFipsCounty()
    {
        return $this->fipsCounty;
    }

    /**
     * Set fipsPlace
     *
     * @param integer $fipsPlace
     * @return Government
     */
    public function setFipsPlace($fipsPlace)
    {
        $this->fipsPlace = $fipsPlace;

        return $this;
    }

    /**
     * Get fipsPlace
     *
     * @return integer
     */
    public function getFipsPlace()
    {
        return $this->fipsPlace;
    }

    /**
     * Set countyAreaName
     *
     * @param string $countyAreaName
     * @return Government
     */
    public function setCountyAreaName($countyAreaName)
    {
        $this->countyAreaName = $countyAreaName;

        return $this;
    }

    /**
     * Get countyAreaName
     *
     * @return string
     */
    public function getCountyAreaName()
    {
        return $this->countyAreaName;
    }

    /**
     * Set latitude
     *
     * @param float $latitude
     * @return Government
     */
    public function setLatitude($latitude)
    {
        $this->latitude = $latitude;

        return $this;
    }

    /**
     * Get latitude
     *
     * @return float
     */
    public function getLatitude()
    {
        return $this->latitude;
    }

    /**
     * Set longitude
     *
     * @param float $longitude
     * @return Government
     */
    public function setLongitude($longitude)
    {
        $this->longitude = $longitude;

        return $this;
    }

    /**
     * Get longitude
     *
     * @return float
     */
    public function getLongitude()
    {
        return $this->longitude;
    }

    /**
     * Set rand
     *
     * @param float $rand
     * @return Government
     */
    public function setRand($rand)
    {
        $this->rand = $rand;

        return $this;
    }

    /**
     * Get rand
     *
     * @return float
     */
    public function getRand()
    {
        return $this->rand;
    }

    /**
     * Set medianWagesGeneralPublic
     *
     * @param float $medianWagesGeneralPublic
     * @return Government
     */
    public function setMedianWagesGeneralPublic($medianWagesGeneralPublic)
    {
        $this->medianWagesGeneralPublic = $medianWagesGeneralPublic;

        return $this;
    }

    /**
     * Get medianWagesGeneralPublic
     *
     * @return float
     */
    public function getMedianWagesGeneralPublic()
    {
        return $this->medianWagesGeneralPublic;
    }

    /**
     * Set medianBenefitsGeneralPublic
     *
     * @param float $medianBenefitsGeneralPublic
     * @return Government
     */
    public function setMedianBenefitsGeneralPublic($medianBenefitsGeneralPublic)
    {
        $this->medianBenefitsGeneralPublic = $medianBenefitsGeneralPublic;

        return $this;
    }

    /**
     * Get medianBenefitsGeneralPublic
     *
     * @return float
     */
    public function getMedianBenefitsGeneralPublic()
    {
        return $this->medianBenefitsGeneralPublic;
    }

    /**
     * Set medianTotalCompGeneralPublic
     *
     * @param float $medianTotalCompGeneralPublic
     * @return Government
     */
    public function setMedianTotalCompGeneralPublic($medianTotalCompGeneralPublic)
    {
        $this->medianTotalCompGeneralPublic = $medianTotalCompGeneralPublic;

        return $this;
    }

    /**
     * Get medianTotalCompGeneralPublic
     *
     * @return float
     */
    public function getMedianTotalCompGeneralPublic()
    {
        return $this->medianTotalCompGeneralPublic;
    }

    /**
     * Set medianHomePrice
     *
     * @param float $medianHomePrice
     * @return Government
     */
    public function setMedianHomePrice($medianHomePrice)
    {
        $this->medianHomePrice = $medianHomePrice;

        return $this;
    }

    /**
     * Get medianHomePrice
     *
     * @return float
     */
    public function getMedianHomePrice()
    {
        return $this->medianHomePrice;
    }

    /**
     * Set medianSalaryPerFullTimeEmp
     *
     * @param float $medianSalaryPerFullTimeEmp
     * @return Government
     */
    public function setMedianSalaryPerFullTimeEmp($medianSalaryPerFullTimeEmp)
    {
        $this->medianSalaryPerFullTimeEmp = $medianSalaryPerFullTimeEmp;

        return $this;
    }

    /**
     * Get medianSalaryPerFullTimeEmp
     *
     * @return float
     */
    public function getMedianSalaryPerFullTimeEmp()
    {
        return $this->medianSalaryPerFullTimeEmp;
    }

    /**
     * Set medianBenefitsPerFtEmp
     *
     * @param float $medianBenefitsPerFtEmp
     * @return Government
     */
    public function setMedianBenefitsPerFtEmp($medianBenefitsPerFtEmp)
    {
        $this->medianBenefitsPerFtEmp = $medianBenefitsPerFtEmp;

        return $this;
    }

    /**
     * Get medianBenefitsPerFtEmp
     *
     * @return float
     */
    public function getMedianBenefitsPerFtEmp()
    {
        return $this->medianBenefitsPerFtEmp;
    }

    /**
     * Set medianTotalCompPerFtEmp
     *
     * @param float $medianTotalCompPerFtEmp
     * @return Government
     */
    public function setMedianTotalCompPerFtEmp($medianTotalCompPerFtEmp)
    {
        $this->medianTotalCompPerFtEmp = $medianTotalCompPerFtEmp;

        return $this;
    }

    /**
     * Get medianTotalCompPerFtEmp
     *
     * @return float
     */
    public function getMedianTotalCompPerFtEmp()
    {
        return $this->medianTotalCompPerFtEmp;
    }

    /**
     * Set medianTotalCompOverMedianIndividualComp
     *
     * @param float $medianTotalCompOverMedianIndividualComp
     * @return Government
     */
    public function setMedianTotalCompOverMedianIndividualComp($medianTotalCompOverMedianIndividualComp)
    {
        $this->medianTotalCompOverMedianIndividualComp = $medianTotalCompOverMedianIndividualComp;

        return $this;
    }

    /**
     * Get medianTotalCompOverMedianIndividualComp
     *
     * @return float
     */
    public function getMedianTotalCompOverMedianIndividualComp()
    {
        return $this->medianTotalCompOverMedianIndividualComp;
    }

    /**
     * Set nameOfHighestPaidEmployee
     *
     * @param string $nameOfHighestPaidEmployee
     * @return Government
     */
    public function setNameOfHighestPaidEmployee($nameOfHighestPaidEmployee)
    {
        $this->nameOfHighestPaidEmployee = $nameOfHighestPaidEmployee;

        return $this;
    }

    /**
     * Get nameOfHighestPaidEmployee
     *
     * @return string
     */
    public function getNameOfHighestPaidEmployee()
    {
        return $this->nameOfHighestPaidEmployee;
    }

    /**
     * Set titleOfHighestPaidEmployee
     *
     * @param string $titleOfHighestPaidEmployee
     * @return Government
     */
    public function setTitleOfHighestPaidEmployee($titleOfHighestPaidEmployee)
    {
        $this->titleOfHighestPaidEmployee = $titleOfHighestPaidEmployee;

        return $this;
    }

    /**
     * Get titleOfHighestPaidEmployee
     *
     * @return string
     */
    public function getTitleOfHighestPaidEmployee()
    {
        return $this->titleOfHighestPaidEmployee;
    }

    /**
     * Set totalCompForHighestPaidEmp
     *
     * @param float $totalCompForHighestPaidEmp
     * @return Government
     */
    public function setTotalCompForHighestPaidEmp($totalCompForHighestPaidEmp)
    {
        $this->totalCompForHighestPaidEmp = $totalCompForHighestPaidEmp;

        return $this;
    }

    /**
     * Get totalCompForHighestPaidEmp
     *
     * @return float
     */
    public function getTotalCompForHighestPaidEmp()
    {
        return $this->totalCompForHighestPaidEmp;
    }

    /**
     * Set numberOfFullTimeEmployees
     *
     * @param float $numberOfFullTimeEmployees
     * @return Government
     */
    public function setNumberOfFullTimeEmployees($numberOfFullTimeEmployees)
    {
        $this->numberOfFullTimeEmployees = $numberOfFullTimeEmployees;

        return $this;
    }

    /**
     * Get numberOfFullTimeEmployees
     *
     * @return float
     */
    public function getNumberOfFullTimeEmployees()
    {
        return $this->numberOfFullTimeEmployees;
    }

    /**
     * Set fullTimeEmployeesOverPopulation
     *
     * @param float $fullTimeEmployeesOverPopulation
     * @return Government
     */
    public function setFullTimeEmployeesOverPopulation($fullTimeEmployeesOverPopulation)
    {
        $this->fullTimeEmployeesOverPopulation = $fullTimeEmployeesOverPopulation;

        return $this;
    }

    /**
     * Get fullTimeEmployeesOverPopulation
     *
     * @return float
     */
    public function getFullTimeEmployeesOverPopulation()
    {
        return $this->fullTimeEmployeesOverPopulation;
    }

    /**
     * Set totalWages
     *
     * @param float $totalWages
     * @return Government
     */
    public function setTotalWages($totalWages)
    {
        $this->totalWages = $totalWages;

        return $this;
    }

    /**
     * Get totalWages
     *
     * @return float
     */
    public function getTotalWages()
    {
        return $this->totalWages;
    }

    /**
     * Set totalSalariesPlusBenefits
     *
     * @param float $totalSalariesPlusBenefits
     * @return Government
     */
    public function setTotalSalariesPlusBenefits($totalSalariesPlusBenefits)
    {
        $this->totalSalariesPlusBenefits = $totalSalariesPlusBenefits;

        return $this;
    }

    /**
     * Get totalSalariesPlusBenefits
     *
     * @return float
     */
    public function getTotalSalariesPlusBenefits()
    {
        return $this->totalSalariesPlusBenefits;
    }

    /**
     * Set pensionContribution
     *
     * @param float $pensionContribution
     * @return Government
     */
    public function setPensionContribution($pensionContribution)
    {
        $this->pensionContribution = $pensionContribution;

        return $this;
    }

    /**
     * Get pensionContribution
     *
     * @return float
     */
    public function getPensionContribution()
    {
        return $this->pensionContribution;
    }

    /**
     * Set pensionUaal
     *
     * @param float $pensionUaal
     * @return Government
     */
    public function setPensionUaal($pensionUaal)
    {
        $this->pensionUaal = $pensionUaal;

        return $this;
    }

    /**
     * Get pensionUaal
     *
     * @return float
     */
    public function getPensionUaal()
    {
        return $this->pensionUaal;
    }

    /**
     * Set medianPension30YearRetiree
     *
     * @param float $medianPension30YearRetiree
     * @return Government
     */
    public function setMedianPension30YearRetiree($medianPension30YearRetiree)
    {
        $this->medianPension30YearRetiree = $medianPension30YearRetiree;

        return $this;
    }

    /**
     * Get medianPension30YearRetiree
     *
     * @return float
     */
    public function getMedianPension30YearRetiree()
    {
        return $this->medianPension30YearRetiree;
    }

    /**
     * Set pensionContributionOverTotalRevenue
     *
     * @param float $pensionContributionOverTotalRevenue
     * @return Government
     */
    public function setPensionContributionOverTotalRevenue($pensionContributionOverTotalRevenue)
    {
        $this->pensionContributionOverTotalRevenue = $pensionContributionOverTotalRevenue;

        return $this;
    }

    /**
     * Get pensionContributionOverTotalRevenue
     *
     * @return float
     */
    public function getPensionContributionOverTotalRevenue()
    {
        return $this->pensionContributionOverTotalRevenue;
    }

    /**
     * Set formerEmpWithLargestPension
     *
     * @param string $formerEmpWithLargestPension
     * @return Government
     */
    public function setFormerEmpWithLargestPension($formerEmpWithLargestPension)
    {
        $this->formerEmpWithLargestPension = $formerEmpWithLargestPension;

        return $this;
    }

    /**
     * Get formerEmpWithLargestPension
     *
     * @return string
     */
    public function getFormerEmpWithLargestPension()
    {
        return $this->formerEmpWithLargestPension;
    }

    /**
     * Set amountOfLargestPension
     *
     * @param float $amountOfLargestPension
     * @return Government
     */
    public function setAmountOfLargestPension($amountOfLargestPension)
    {
        $this->amountOfLargestPension = $amountOfLargestPension;

        return $this;
    }

    /**
     * Get amountOfLargestPension
     *
     * @return float
     */
    public function getAmountOfLargestPension()
    {
        return $this->amountOfLargestPension;
    }

    /**
     * Set opebArc
     *
     * @param float $opebArc
     * @return Government
     */
    public function setOpebArc($opebArc)
    {
        $this->opebArc = $opebArc;

        return $this;
    }

    /**
     * Get opebArc
     *
     * @return float
     */
    public function getOpebArc()
    {
        return $this->opebArc;
    }

    /**
     * Set opebActualContribution
     *
     * @param float $opebActualContribution
     * @return Government
     */
    public function setOpebActualContribution($opebActualContribution)
    {
        $this->opebActualContribution = $opebActualContribution;

        return $this;
    }

    /**
     * Get opebActualContribution
     *
     * @return float
     */
    public function getOpebActualContribution()
    {
        return $this->opebActualContribution;
    }

    /**
     * Set opebUaal
     *
     * @param float $opebUaal
     * @return Government
     */
    public function setOpebUaal($opebUaal)
    {
        $this->opebUaal = $opebUaal;

        return $this;
    }

    /**
     * Get opebUaal
     *
     * @return float
     */
    public function getOpebUaal()
    {
        return $this->opebUaal;
    }

    /**
     * Set opebArcOverTotalRevenue
     *
     * @param float $opebArcOverTotalRevenue
     * @return Government
     */
    public function setOpebArcOverTotalRevenue($opebArcOverTotalRevenue)
    {
        $this->opebArcOverTotalRevenue = $opebArcOverTotalRevenue;

        return $this;
    }

    /**
     * Get opebArcOverTotalRevenue
     *
     * @return float
     */
    public function getOpebArcOverTotalRevenue()
    {
        return $this->opebArcOverTotalRevenue;
    }

    /**
     * Set pensionPlusOpebArcOverTotRev
     *
     * @param float $pensionPlusOpebArcOverTotRev
     * @return Government
     */
    public function setPensionPlusOpebArcOverTotRev($pensionPlusOpebArcOverTotRev)
    {
        $this->pensionPlusOpebArcOverTotRev = $pensionPlusOpebArcOverTotRev;

        return $this;
    }

    /**
     * Get pensionPlusOpebArcOverTotRev
     *
     * @return float
     */
    public function getPensionPlusOpebArcOverTotRev()
    {
        return $this->pensionPlusOpebArcOverTotRev;
    }

    /**
     * Set academicPerformanceIndex
     *
     * @param float $academicPerformanceIndex
     * @return Government
     */
    public function setAcademicPerformanceIndex($academicPerformanceIndex)
    {
        $this->academicPerformanceIndex = $academicPerformanceIndex;

        return $this;
    }

    /**
     * Get academicPerformanceIndex
     *
     * @return float
     */
    public function getAcademicPerformanceIndex()
    {
        return $this->academicPerformanceIndex;
    }

    /**
     * Set satScores
     *
     * @param float $satScores
     * @return Government
     */
    public function setSatScores($satScores)
    {
        $this->satScores = $satScores;

        return $this;
    }

    /**
     * Get satScores
     *
     * @return float
     */
    public function getSatScores()
    {
        return $this->satScores;
    }

    /**
     * Set parentTriggerEligibleSchools
     *
     * @param string $parentTriggerEligibleSchools
     * @return Government
     */
    public function setParentTriggerEligibleSchools($parentTriggerEligibleSchools)
    {
        $this->parentTriggerEligibleSchools = $parentTriggerEligibleSchools;

        return $this;
    }

    /**
     * Get parentTriggerEligibleSchools
     *
     * @return string
     */
    public function getParentTriggerEligibleSchools()
    {
        return $this->parentTriggerEligibleSchools;
    }

    /**
     * Set openEnrollmentSchools
     *
     * @param string $openEnrollmentSchools
     * @return Government
     */
    public function setOpenEnrollmentSchools($openEnrollmentSchools)
    {
        $this->openEnrollmentSchools = $openEnrollmentSchools;

        return $this;
    }

    /**
     * Get openEnrollmentSchools
     *
     * @return string
     */
    public function getOpenEnrollmentSchools()
    {
        return $this->openEnrollmentSchools;
    }

    /**
     * Set violentCrimesPer100000Population
     *
     * @param float $violentCrimesPer100000Population
     * @return Government
     */
    public function setViolentCrimesPer100000Population($violentCrimesPer100000Population)
    {
        $this->violentCrimesPer100000Population = $violentCrimesPer100000Population;

        return $this;
    }

    /**
     * Get violentCrimesPer100000Population
     *
     * @return float
     */
    public function getViolentCrimesPer100000Population()
    {
        return $this->violentCrimesPer100000Population;
    }

    /**
     * Set propertyCrimesPer100000Population
     *
     * @param float $propertyCrimesPer100000Population
     * @return Government
     */
    public function setPropertyCrimesPer100000Population($propertyCrimesPer100000Population)
    {
        $this->propertyCrimesPer100000Population = $propertyCrimesPer100000Population;

        return $this;
    }

    /**
     * Get propertyCrimesPer100000Population
     *
     * @return float
     */
    public function getPropertyCrimesPer100000Population()
    {
        return $this->propertyCrimesPer100000Population;
    }

    /**
     * Set pavementConditionIndex
     *
     * @param float $pavementConditionIndex
     * @return Government
     */
    public function setPavementConditionIndex($pavementConditionIndex)
    {
        $this->pavementConditionIndex = $pavementConditionIndex;

        return $this;
    }

    /**
     * Get pavementConditionIndex
     *
     * @return float
     */
    public function getPavementConditionIndex()
    {
        return $this->pavementConditionIndex;
    }

    /**
     * Set salesTaxRate
     *
     * @param float $salesTaxRate
     * @return Government
     */
    public function setSalesTaxRate($salesTaxRate)
    {
        $this->salesTaxRate = $salesTaxRate;

        return $this;
    }

    /**
     * Get salesTaxRate
     *
     * @return float
     */
    public function getSalesTaxRate()
    {
        return $this->salesTaxRate;
    }

    /**
     * Set libraryHoursPerWeek
     *
     * @param float $libraryHoursPerWeek
     * @return Government
     */
    public function setLibraryHoursPerWeek($libraryHoursPerWeek)
    {
        $this->libraryHoursPerWeek = $libraryHoursPerWeek;

        return $this;
    }

    /**
     * Get libraryHoursPerWeek
     *
     * @return float
     */
    public function getLibraryHoursPerWeek()
    {
        return $this->libraryHoursPerWeek;
    }

    /**
     * Set graduationRate
     *
     * @param float $graduationRate
     * @return Government
     */
    public function setGraduationRate($graduationRate)
    {
        $this->graduationRate = $graduationRate;

        return $this;
    }

    /**
     * Get graduationRate
     *
     * @return float
     */
    public function getGraduationRate()
    {
        return $this->graduationRate;
    }

    /**
     * Set dropoutRate
     *
     * @param float $dropoutRate
     * @return Government
     */
    public function setDropoutRate($dropoutRate)
    {
        $this->dropoutRate = $dropoutRate;

        return $this;
    }

    /**
     * Get dropoutRate
     *
     * @return float
     */
    public function getDropoutRate()
    {
        return $this->dropoutRate;
    }

    /**
     * Set publicSafetyExpOverTotGovFundRevenue
     *
     * @param float $publicSafetyExpOverTotGovFundRevenue
     * @return Government
     */
    public function setPublicSafetyExpOverTotGovFundRevenue($publicSafetyExpOverTotGovFundRevenue)
    {
        $this->publicSafetyExpOverTotGovFundRevenue = $publicSafetyExpOverTotGovFundRevenue;

        return $this;
    }

    /**
     * Get publicSafetyExpOverTotGovFundRevenue
     *
     * @return float
     */
    public function getPublicSafetyExpOverTotGovFundRevenue()
    {
        return $this->publicSafetyExpOverTotGovFundRevenue;
    }

    /**
     * Set publicSafetyExpOverGeneralFundRevenue
     *
     * @param float $publicSafetyExpOverGeneralFundRevenue
     * @return Government
     */
    public function setPublicSafetyExpOverGeneralFundRevenue($publicSafetyExpOverGeneralFundRevenue)
    {
        $this->publicSafetyExpOverGeneralFundRevenue = $publicSafetyExpOverGeneralFundRevenue;

        return $this;
    }

    /**
     * Get publicSafetyExpOverGeneralFundRevenue
     *
     * @return float
     */
    public function getPublicSafetyExpOverGeneralFundRevenue()
    {
        return $this->publicSafetyExpOverGeneralFundRevenue;
    }

    /**
     * Set generalFundBalanceOverGeneralFundExp
     *
     * @param float $generalFundBalanceOverGeneralFundExp
     * @return Government
     */
    public function setGeneralFundBalanceOverGeneralFundExp($generalFundBalanceOverGeneralFundExp)
    {
        $this->generalFundBalanceOverGeneralFundExp = $generalFundBalanceOverGeneralFundExp;

        return $this;
    }

    /**
     * Get generalFundBalanceOverGeneralFundExp
     *
     * @return float
     */
    public function getGeneralFundBalanceOverGeneralFundExp()
    {
        return $this->generalFundBalanceOverGeneralFundExp;
    }

    /**
     * Set totalDebtOverTotalRevenue
     *
     * @param float $totalDebtOverTotalRevenue
     * @return Government
     */
    public function setTotalDebtOverTotalRevenue($totalDebtOverTotalRevenue)
    {
        $this->totalDebtOverTotalRevenue = $totalDebtOverTotalRevenue;

        return $this;
    }

    /**
     * Get totalDebtOverTotalRevenue
     *
     * @return float
     */
    public function getTotalDebtOverTotalRevenue()
    {
        return $this->totalDebtOverTotalRevenue;
    }

    /**
     * Set defaultProbability
     *
     * @param float $defaultProbability
     * @return Government
     */
    public function setDefaultProbability($defaultProbability)
    {
        $this->defaultProbability = $defaultProbability;

        return $this;
    }

    /**
     * Get defaultProbability
     *
     * @return float
     */
    public function getDefaultProbability()
    {
        return $this->defaultProbability;
    }

    /**
     * Set totalGovernmentalFundRevenues
     *
     * @param float $totalGovernmentalFundRevenues
     * @return Government
     */
    public function setTotalGovernmentalFundRevenues($totalGovernmentalFundRevenues)
    {
        $this->totalGovernmentalFundRevenues = $totalGovernmentalFundRevenues;

        return $this;
    }

    /**
     * Get totalGovernmentalFundRevenues
     *
     * @return float
     */
    public function getTotalGovernmentalFundRevenues()
    {
        return $this->totalGovernmentalFundRevenues;
    }

    /**
     * Set totalRevenue
     *
     * @param float $totalRevenue
     * @return Government
     */
    public function setTotalRevenue($totalRevenue)
    {
        $this->totalRevenue = $totalRevenue;

        return $this;
    }

    /**
     * Get totalRevenue
     *
     * @return float
     */
    public function getTotalRevenue()
    {
        return $this->totalRevenue;
    }

    /**
     * Set totalRevenuePerCapita
     *
     * @param float $totalRevenuePerCapita
     * @return Government
     */
    public function setTotalRevenuePerCapita($totalRevenuePerCapita)
    {
        $this->totalRevenuePerCapita = $totalRevenuePerCapita;

        return $this;
    }

    /**
     * Get totalRevenuePerCapita
     *
     * @return float
     */
    public function getTotalRevenuePerCapita()
    {
        return $this->totalRevenuePerCapita;
    }

    /**
     * Set totalGovernmentalFundExpenditures
     *
     * @param float $totalGovernmentalFundExpenditures
     * @return Government
     */
    public function setTotalGovernmentalFundExpenditures($totalGovernmentalFundExpenditures)
    {
        $this->totalGovernmentalFundExpenditures = $totalGovernmentalFundExpenditures;

        return $this;
    }

    /**
     * Get totalGovernmentalFundExpenditures
     *
     * @return float
     */
    public function getTotalGovernmentalFundExpenditures()
    {
        return $this->totalGovernmentalFundExpenditures;
    }

    /**
     * Set totalExpenditures
     *
     * @param float $totalExpenditures
     * @return Government
     */
    public function setTotalExpenditures($totalExpenditures)
    {
        $this->totalExpenditures = $totalExpenditures;

        return $this;
    }

    /**
     * Get totalExpenditures
     *
     * @return float
     */
    public function getTotalExpenditures()
    {
        return $this->totalExpenditures;
    }

    /**
     * Set totalExpendituresPerCapita
     *
     * @param float $totalExpendituresPerCapita
     * @return Government
     */
    public function setTotalExpendituresPerCapita($totalExpendituresPerCapita)
    {
        $this->totalExpendituresPerCapita = $totalExpendituresPerCapita;

        return $this;
    }

    /**
     * Get totalExpendituresPerCapita
     *
     * @return float
     */
    public function getTotalExpendituresPerCapita()
    {
        return $this->totalExpendituresPerCapita;
    }

    /**
     * Set expenditurePerStudent
     *
     * @param float $expenditurePerStudent
     * @return Government
     */
    public function setExpenditurePerStudent($expenditurePerStudent)
    {
        $this->expenditurePerStudent = $expenditurePerStudent;

        return $this;
    }

    /**
     * Get expenditurePerStudent
     *
     * @return float
     */
    public function getExpenditurePerStudent()
    {
        return $this->expenditurePerStudent;
    }

    /**
     * Set gfSurplusOverGfRevenue
     *
     * @param float $gfSurplusOverGfRevenue
     * @return Government
     */
    public function setGfSurplusOverGfRevenue($gfSurplusOverGfRevenue)
    {
        $this->gfSurplusOverGfRevenue = $gfSurplusOverGfRevenue;

        return $this;
    }

    /**
     * Get gfSurplusOverGfRevenue
     *
     * @return float
     */
    public function getGfSurplusOverGfRevenue()
    {
        return $this->gfSurplusOverGfRevenue;
    }

    /**
     * Set changeInGovernmentalFundRevenue
     *
     * @param float $changeInGovernmentalFundRevenue
     * @return Government
     */
    public function setChangeInGovernmentalFundRevenue($changeInGovernmentalFundRevenue)
    {
        $this->changeInGovernmentalFundRevenue = $changeInGovernmentalFundRevenue;

        return $this;
    }

    /**
     * Get changeInGovernmentalFundRevenue
     *
     * @return float
     */
    public function getChangeInGovernmentalFundRevenue()
    {
        return $this->changeInGovernmentalFundRevenue;
    }

    /**
     * Set incId
     *
     * @param integer $incId
     * @return Government
     */
    public function setIncId($incId)
    {
        $this->incId = $incId;

        return $this;
    }

    /**
     * Get incId
     *
     * @return integer
     */
    public function getIncId()
    {
        return $this->incId;
    }

    /**
     * Set wikipediaPageName
     *
     * @param string $wikipediaPageName
     * @return Government
     */
    public function setWikipediaPageName($wikipediaPageName)
    {
        $this->wikipediaPageName = $wikipediaPageName;

        return $this;
    }

    /**
     * Get wikipediaPageName
     *
     * @return string
     */
    public function getWikipediaPageName()
    {
        return $this->wikipediaPageName;
    }

    /**
     * Set wikipediaPageExists
     *
     * @param integer $wikipediaPageExists
     * @return Government
     */
    public function setWikipediaPageExists($wikipediaPageExists)
    {
        $this->wikipediaPageExists = $wikipediaPageExists;

        return $this;
    }

    /**
     * Get wikipediaPageExists
     *
     * @return integer
     */
    public function getWikipediaPageExists()
    {
        return $this->wikipediaPageExists;
    }

    /**
     * Set transparentCaliforniaPageName
     *
     * @param string $transparentCaliforniaPageName
     * @return Government
     */
    public function setTransparentCaliforniaPageName($transparentCaliforniaPageName)
    {
        $this->transparentCaliforniaPageName = $transparentCaliforniaPageName;

        return $this;
    }

    /**
     * Get transparentCaliforniaPageName
     *
     * @return string
     */
    public function getTransparentCaliforniaPageName()
    {
        return $this->transparentCaliforniaPageName;
    }

    /**
     * Set latestAuditUrl
     *
     * @param string $latestAuditUrl
     * @return Government
     */
    public function setLatestAuditUrl($latestAuditUrl)
    {
        $this->latestAuditUrl = $latestAuditUrl;

        return $this;
    }

    /**
     * Get latestAuditUrl
     *
     * @return string
     */
    public function getLatestAuditUrl()
    {
        return $this->latestAuditUrl;
    }

    /**
     * Set frpmRateRank
     *
     * @param integer $frpmRateRank
     * @return Government
     */
    public function setFrpmRateRank($frpmRateRank)
    {
        $this->frpmRateRank = $frpmRateRank;

        return $this;
    }

    /**
     * Get frpmRateRank
     *
     * @return integer
     */
    public function getFrpmRateRank()
    {
        return $this->frpmRateRank;
    }

    /**
     * Set medianSalaryPerFullTimeEmpRank
     *
     * @param integer $medianSalaryPerFullTimeEmpRank
     * @return Government
     */
    public function setMedianSalaryPerFullTimeEmpRank($medianSalaryPerFullTimeEmpRank)
    {
        $this->medianSalaryPerFullTimeEmpRank = $medianSalaryPerFullTimeEmpRank;

        return $this;
    }

    /**
     * Get medianSalaryPerFullTimeEmpRank
     *
     * @return integer
     */
    public function getMedianSalaryPerFullTimeEmpRank()
    {
        return $this->medianSalaryPerFullTimeEmpRank;
    }

    /**
     * Set medianBenefitsPerFtEmpRank
     *
     * @param integer $medianBenefitsPerFtEmpRank
     * @return Government
     */
    public function setMedianBenefitsPerFtEmpRank($medianBenefitsPerFtEmpRank)
    {
        $this->medianBenefitsPerFtEmpRank = $medianBenefitsPerFtEmpRank;

        return $this;
    }

    /**
     * Get medianBenefitsPerFtEmpRank
     *
     * @return integer
     */
    public function getMedianBenefitsPerFtEmpRank()
    {
        return $this->medianBenefitsPerFtEmpRank;
    }

    /**
     * Set medianTotalCompPerFtEmpRank
     *
     * @param integer $medianTotalCompPerFtEmpRank
     * @return Government
     */
    public function setMedianTotalCompPerFtEmpRank($medianTotalCompPerFtEmpRank)
    {
        $this->medianTotalCompPerFtEmpRank = $medianTotalCompPerFtEmpRank;

        return $this;
    }

    /**
     * Get medianTotalCompPerFtEmpRank
     *
     * @return integer
     */
    public function getMedianTotalCompPerFtEmpRank()
    {
        return $this->medianTotalCompPerFtEmpRank;
    }

    /**
     * Set medianTotalCompOverMedianIndividualCompRank
     *
     * @param integer $medianTotalCompOverMedianIndividualCompRank
     * @return Government
     */
    public function setMedianTotalCompOverMedianIndividualCompRank($medianTotalCompOverMedianIndividualCompRank)
    {
        $this->medianTotalCompOverMedianIndividualCompRank = $medianTotalCompOverMedianIndividualCompRank;

        return $this;
    }

    /**
     * Get medianTotalCompOverMedianIndividualCompRank
     *
     * @return integer
     */
    public function getMedianTotalCompOverMedianIndividualCompRank()
    {
        return $this->medianTotalCompOverMedianIndividualCompRank;
    }

    /**
     * Set totalCompForHighestPaidEmpRank
     *
     * @param integer $totalCompForHighestPaidEmpRank
     * @return Government
     */
    public function setTotalCompForHighestPaidEmpRank($totalCompForHighestPaidEmpRank)
    {
        $this->totalCompForHighestPaidEmpRank = $totalCompForHighestPaidEmpRank;

        return $this;
    }

    /**
     * Get totalCompForHighestPaidEmpRank
     *
     * @return integer
     */
    public function getTotalCompForHighestPaidEmpRank()
    {
        return $this->totalCompForHighestPaidEmpRank;
    }

    /**
     * Set fullTimeEmployeesOverPopulationRank
     *
     * @param integer $fullTimeEmployeesOverPopulationRank
     * @return Government
     */
    public function setFullTimeEmployeesOverPopulationRank($fullTimeEmployeesOverPopulationRank)
    {
        $this->fullTimeEmployeesOverPopulationRank = $fullTimeEmployeesOverPopulationRank;

        return $this;
    }

    /**
     * Get fullTimeEmployeesOverPopulationRank
     *
     * @return integer
     */
    public function getFullTimeEmployeesOverPopulationRank()
    {
        return $this->fullTimeEmployeesOverPopulationRank;
    }

    /**
     * Set pensionContributionOverTotalRevenueRank
     *
     * @param integer $pensionContributionOverTotalRevenueRank
     * @return Government
     */
    public function setPensionContributionOverTotalRevenueRank($pensionContributionOverTotalRevenueRank)
    {
        $this->pensionContributionOverTotalRevenueRank = $pensionContributionOverTotalRevenueRank;

        return $this;
    }

    /**
     * Get pensionContributionOverTotalRevenueRank
     *
     * @return integer
     */
    public function getPensionContributionOverTotalRevenueRank()
    {
        return $this->pensionContributionOverTotalRevenueRank;
    }

    /**
     * Set opebArcOverTotalRevenueRank
     *
     * @param integer $opebArcOverTotalRevenueRank
     * @return Government
     */
    public function setOpebArcOverTotalRevenueRank($opebArcOverTotalRevenueRank)
    {
        $this->opebArcOverTotalRevenueRank = $opebArcOverTotalRevenueRank;

        return $this;
    }

    /**
     * Get opebArcOverTotalRevenueRank
     *
     * @return integer
     */
    public function getOpebArcOverTotalRevenueRank()
    {
        return $this->opebArcOverTotalRevenueRank;
    }

    /**
     * Set pensionPlusOpebArcOverTotRevRank
     *
     * @param integer $pensionPlusOpebArcOverTotRevRank
     * @return Government
     */
    public function setPensionPlusOpebArcOverTotRevRank($pensionPlusOpebArcOverTotRevRank)
    {
        $this->pensionPlusOpebArcOverTotRevRank = $pensionPlusOpebArcOverTotRevRank;

        return $this;
    }

    /**
     * Get pensionPlusOpebArcOverTotRevRank
     *
     * @return integer
     */
    public function getPensionPlusOpebArcOverTotRevRank()
    {
        return $this->pensionPlusOpebArcOverTotRevRank;
    }

    /**
     * Set violentCrimesPer100000PopulationRank
     *
     * @param integer $violentCrimesPer100000PopulationRank
     * @return Government
     */
    public function setViolentCrimesPer100000PopulationRank($violentCrimesPer100000PopulationRank)
    {
        $this->violentCrimesPer100000PopulationRank = $violentCrimesPer100000PopulationRank;

        return $this;
    }

    /**
     * Get violentCrimesPer100000PopulationRank
     *
     * @return integer
     */
    public function getViolentCrimesPer100000PopulationRank()
    {
        return $this->violentCrimesPer100000PopulationRank;
    }

    /**
     * Set propertyCrimesPer100000PopulationRank
     *
     * @param integer $propertyCrimesPer100000PopulationRank
     * @return Government
     */
    public function setPropertyCrimesPer100000PopulationRank($propertyCrimesPer100000PopulationRank)
    {
        $this->propertyCrimesPer100000PopulationRank = $propertyCrimesPer100000PopulationRank;

        return $this;
    }

    /**
     * Get propertyCrimesPer100000PopulationRank
     *
     * @return integer
     */
    public function getPropertyCrimesPer100000PopulationRank()
    {
        return $this->propertyCrimesPer100000PopulationRank;
    }

    /**
     * Set academicPerformanceIndexRank
     *
     * @param integer $academicPerformanceIndexRank
     * @return Government
     */
    public function setAcademicPerformanceIndexRank($academicPerformanceIndexRank)
    {
        $this->academicPerformanceIndexRank = $academicPerformanceIndexRank;

        return $this;
    }

    /**
     * Get academicPerformanceIndexRank
     *
     * @return integer
     */
    public function getAcademicPerformanceIndexRank()
    {
        return $this->academicPerformanceIndexRank;
    }

    /**
     * Set satScoresRank
     *
     * @param integer $satScoresRank
     * @return Government
     */
    public function setSatScoresRank($satScoresRank)
    {
        $this->satScoresRank = $satScoresRank;

        return $this;
    }

    /**
     * Get satScoresRank
     *
     * @return integer
     */
    public function getSatScoresRank()
    {
        return $this->satScoresRank;
    }

    /**
     * Set salesTaxRateRank
     *
     * @param integer $salesTaxRateRank
     * @return Government
     */
    public function setSalesTaxRateRank($salesTaxRateRank)
    {
        $this->salesTaxRateRank = $salesTaxRateRank;

        return $this;
    }

    /**
     * Get salesTaxRateRank
     *
     * @return integer
     */
    public function getSalesTaxRateRank()
    {
        return $this->salesTaxRateRank;
    }

    /**
     * Set libraryHoursPerWeekRank
     *
     * @param integer $libraryHoursPerWeekRank
     * @return Government
     */
    public function setLibraryHoursPerWeekRank($libraryHoursPerWeekRank)
    {
        $this->libraryHoursPerWeekRank = $libraryHoursPerWeekRank;

        return $this;
    }

    /**
     * Get libraryHoursPerWeekRank
     *
     * @return integer
     */
    public function getLibraryHoursPerWeekRank()
    {
        return $this->libraryHoursPerWeekRank;
    }

    /**
     * Set graduationRateRank
     *
     * @param integer $graduationRateRank
     * @return Government
     */
    public function setGraduationRateRank($graduationRateRank)
    {
        $this->graduationRateRank = $graduationRateRank;

        return $this;
    }

    /**
     * Get graduationRateRank
     *
     * @return integer
     */
    public function getGraduationRateRank()
    {
        return $this->graduationRateRank;
    }

    /**
     * Set dropoutRateRank
     *
     * @param integer $dropoutRateRank
     * @return Government
     */
    public function setDropoutRateRank($dropoutRateRank)
    {
        $this->dropoutRateRank = $dropoutRateRank;

        return $this;
    }

    /**
     * Get dropoutRateRank
     *
     * @return integer
     */
    public function getDropoutRateRank()
    {
        return $this->dropoutRateRank;
    }

    /**
     * Set totalDebtOverTotalRevenueRank
     *
     * @param integer $totalDebtOverTotalRevenueRank
     * @return Government
     */
    public function setTotalDebtOverTotalRevenueRank($totalDebtOverTotalRevenueRank)
    {
        $this->totalDebtOverTotalRevenueRank = $totalDebtOverTotalRevenueRank;

        return $this;
    }

    /**
     * Get totalDebtOverTotalRevenueRank
     *
     * @return integer
     */
    public function getTotalDebtOverTotalRevenueRank()
    {
        return $this->totalDebtOverTotalRevenueRank;
    }

    /**
     * Set expenditurePerStudentRank
     *
     * @param integer $expenditurePerStudentRank
     * @return Government
     */
    public function setExpenditurePerStudentRank($expenditurePerStudentRank)
    {
        $this->expenditurePerStudentRank = $expenditurePerStudentRank;

        return $this;
    }

    /**
     * Get expenditurePerStudentRank
     *
     * @return integer
     */
    public function getExpenditurePerStudentRank()
    {
        return $this->expenditurePerStudentRank;
    }

    /**
     * Set generalFundBalanceOverGeneralFundExpRank
     *
     * @param integer $generalFundBalanceOverGeneralFundExpRank
     * @return Government
     */
    public function setGeneralFundBalanceOverGeneralFundExpRank($generalFundBalanceOverGeneralFundExpRank)
    {
        $this->generalFundBalanceOverGeneralFundExpRank = $generalFundBalanceOverGeneralFundExpRank;

        return $this;
    }

    /**
     * Get generalFundBalanceOverGeneralFundExpRank
     *
     * @return integer
     */
    public function getGeneralFundBalanceOverGeneralFundExpRank()
    {
        return $this->generalFundBalanceOverGeneralFundExpRank;
    }

    /**
     * Set gfSurplusOverGfRevenueRank
     *
     * @param integer $gfSurplusOverGfRevenueRank
     * @return Government
     */
    public function setGfSurplusOverGfRevenueRank($gfSurplusOverGfRevenueRank)
    {
        $this->gfSurplusOverGfRevenueRank = $gfSurplusOverGfRevenueRank;

        return $this;
    }

    /**
     * Get gfSurplusOverGfRevenueRank
     *
     * @return integer
     */
    public function getGfSurplusOverGfRevenueRank()
    {
        return $this->gfSurplusOverGfRevenueRank;
    }

    /**
     * Set changeInGovernmentalFundRevenueRank
     *
     * @param integer $changeInGovernmentalFundRevenueRank
     * @return Government
     */
    public function setChangeInGovernmentalFundRevenueRank($changeInGovernmentalFundRevenueRank)
    {
        $this->changeInGovernmentalFundRevenueRank = $changeInGovernmentalFundRevenueRank;

        return $this;
    }

    /**
     * Get changeInGovernmentalFundRevenueRank
     *
     * @return integer
     */
    public function getChangeInGovernmentalFundRevenueRank()
    {
        return $this->changeInGovernmentalFundRevenueRank;
    }

    /**
     * Set defaultProbabilityRank
     *
     * @param integer $defaultProbabilityRank
     * @return Government
     */
    public function setDefaultProbabilityRank($defaultProbabilityRank)
    {
        $this->defaultProbabilityRank = $defaultProbabilityRank;

        return $this;
    }

    /**
     * Get defaultProbabilityRank
     *
     * @return integer
     */
    public function getDefaultProbabilityRank()
    {
        return $this->defaultProbabilityRank;
    }

    /**
     * Set publicSafetyExpOverTotGovFundRevenueRank
     *
     * @param integer $publicSafetyExpOverTotGovFundRevenueRank
     * @return Government
     */
    public function setPublicSafetyExpOverTotGovFundRevenueRank($publicSafetyExpOverTotGovFundRevenueRank)
    {
        $this->publicSafetyExpOverTotGovFundRevenueRank = $publicSafetyExpOverTotGovFundRevenueRank;

        return $this;
    }

    /**
     * Get publicSafetyExpOverTotGovFundRevenueRank
     *
     * @return integer
     */
    public function getPublicSafetyExpOverTotGovFundRevenueRank()
    {
        return $this->publicSafetyExpOverTotGovFundRevenueRank;
    }

    /**
     * Set publicSafetyExpOverGeneralFundRevenueRank
     *
     * @param integer $publicSafetyExpOverGeneralFundRevenueRank
     * @return Government
     */
    public function setPublicSafetyExpOverGeneralFundRevenueRank($publicSafetyExpOverGeneralFundRevenueRank)
    {
        $this->publicSafetyExpOverGeneralFundRevenueRank = $publicSafetyExpOverGeneralFundRevenueRank;

        return $this;
    }

    /**
     * Get publicSafetyExpOverGeneralFundRevenueRank
     *
     * @return integer
     */
    public function getPublicSafetyExpOverGeneralFundRevenueRank()
    {
        return $this->publicSafetyExpOverGeneralFundRevenueRank;
    }

    /**
     * Set totalRevenuePerCapitaRank
     *
     * @param integer $totalRevenuePerCapitaRank
     * @return Government
     */
    public function setTotalRevenuePerCapitaRank($totalRevenuePerCapitaRank)
    {
        $this->totalRevenuePerCapitaRank = $totalRevenuePerCapitaRank;

        return $this;
    }

    /**
     * Get totalRevenuePerCapitaRank
     *
     * @return integer
     */
    public function getTotalRevenuePerCapitaRank()
    {
        return $this->totalRevenuePerCapitaRank;
    }

    /**
     * Set totalExpendituresPerCapitaRank
     *
     * @param integer $totalExpendituresPerCapitaRank
     * @return Government
     */
    public function setTotalExpendituresPerCapitaRank($totalExpendituresPerCapitaRank)
    {
        $this->totalExpendituresPerCapitaRank = $totalExpendituresPerCapitaRank;

        return $this;
    }

    /**
     * Get totalExpendituresPerCapitaRank
     *
     * @return integer
     */
    public function getTotalExpendituresPerCapitaRank()
    {
        return $this->totalExpendituresPerCapitaRank;
    }

    /**
     * Set medianTotalCompGeneralPublicRank
     *
     * @param integer $medianTotalCompGeneralPublicRank
     * @return Government
     */
    public function setMedianTotalCompGeneralPublicRank($medianTotalCompGeneralPublicRank)
    {
        $this->medianTotalCompGeneralPublicRank = $medianTotalCompGeneralPublicRank;

        return $this;
    }

    /**
     * Get medianTotalCompGeneralPublicRank
     *
     * @return integer
     */
    public function getMedianTotalCompGeneralPublicRank()
    {
        return $this->medianTotalCompGeneralPublicRank;
    }

    /**
     * Set medianHomePriceRank
     *
     * @param integer $medianHomePriceRank
     * @return Government
     */
    public function setMedianHomePriceRank($medianHomePriceRank)
    {
        $this->medianHomePriceRank = $medianHomePriceRank;

        return $this;
    }

    /**
     * Get medianHomePriceRank
     *
     * @return integer
     */
    public function getMedianHomePriceRank()
    {
        return $this->medianHomePriceRank;
    }

    /**
     * Set populationRank
     *
     * @param integer $populationRank
     * @return Government
     */
    public function setPopulationRank($populationRank)
    {
        $this->populationRank = $populationRank;

        return $this;
    }

    /**
     * Get populationRank
     *
     * @return integer
     */
    public function getPopulationRank()
    {
        return $this->populationRank;
    }

    /**
     * Set enrollmentRank
     *
     * @param integer $enrollmentRank
     *
     * @return Government
     */
    public function setEnrollmentRank($enrollmentRank)
    {
        $this->enrollmentRank = $enrollmentRank;

        return $this;
    }

    /**
     * Get enrollmentRank
     *
     * @return integer
     */
    public function getEnrollmentRank()
    {
        return $this->enrollmentRank;
    }

    /**
     * @param Environment $environment A Environment instance.
     *
     * @return Government
     */
    public function setEnvironment(Environment $environment)
    {
        $this->environment = $environment;

        return $this;
    }

    /**
     * @return Environment
     */
    public function getEnvironment()
    {
        return $this->environment;
    }

    /**
     * Set sqMiles
     *
     * @param float $sqMiles
     * @return Government
     */
    public function setSqMiles($sqMiles)
    {
        $this->sqMiles = $sqMiles;

        return $this;
    }

    /**
     * Get sqMiles
     *
     * @return float
     */
    public function getSqMiles()
    {
        return $this->sqMiles;
    }

    /**
     * Set numberOfEmployees
     *
     * @param float $numberOfEmployees
     * @return Government
     */
    public function setNumberOfEmployees($numberOfEmployees)
    {
        $this->numberOfEmployees = $numberOfEmployees;

        return $this;
    }

    /**
     * Get numberOfEmployees
     *
     * @return float
     */
    public function getNumberOfEmployees()
    {
        return $this->numberOfEmployees;
    }

    /**
     * Set unemploymentRate
     *
     * @param float $unemploymentRate
     * @return Government
     */
    public function setUnemploymentRate($unemploymentRate)
    {
        $this->unemploymentRate = $unemploymentRate;

        return $this;
    }

    /**
     * Get unemploymentRate
     *
     * @return float
     */
    public function getUnemploymentRate()
    {
        return $this->unemploymentRate;
    }

    /**
     * Set annualSalaryMayor
     *
     * @param float $annualSalaryMayor
     * @return Government
     */
    public function setAnnualSalaryMayor($annualSalaryMayor)
    {
        $this->annualSalaryMayor = $annualSalaryMayor;

        return $this;
    }

    /**
     * Get annualSalaryMayor
     *
     * @return float
     */
    public function getAnnualSalaryMayor()
    {
        return $this->annualSalaryMayor;
    }

    /**
     * Set mayorName
     *
     * @param string $mayorName
     * @return Government
     */
    public function setMayorName($mayorName)
    {
        $this->mayorName = $mayorName;

        return $this;
    }

    /**
     * Get mayorName
     *
     * @return string
     */
    public function getMayorName()
    {
        return $this->mayorName;
    }

    /**
     * Set yearsMayorInOffice
     *
     * @param integer $yearsMayorInOffice
     * @return Government
     */
    public function setYearsMayorInOffice($yearsMayorInOffice)
    {
        $this->yearsMayorInOffice = $yearsMayorInOffice;

        return $this;
    }

    /**
     * Get yearsMayorInOffice
     *
     * @return integer
     */
    public function getYearsMayorInOffice()
    {
        return $this->yearsMayorInOffice;
    }

    /**
     * Set currentAssets
     *
     * @param float $currentAssets
     * @return Government
     */
    public function setCurrentAssets($currentAssets)
    {
        $this->currentAssets = $currentAssets;

        return $this;
    }

    /**
     * Get currentAssets
     *
     * @return float
     */
    public function getCurrentAssets()
    {
        return $this->currentAssets;
    }

    /**
     * Set currentLiabilities
     *
     * @param float $currentLiabilities
     * @return Government
     */
    public function setCurrentLiabilities($currentLiabilities)
    {
        $this->currentLiabilities = $currentLiabilities;

        return $this;
    }

    /**
     * Get currentLiabilities
     *
     * @return float
     */
    public function getCurrentLiabilities()
    {
        return $this->currentLiabilities;
    }

    /**
     * Set longTermDebt
     *
     * @param float $longTermDebt
     * @return Government
     */
    public function setLongTermDebt($longTermDebt)
    {
        $this->longTermDebt = $longTermDebt;

        return $this;
    }

    /**
     * Get longTermDebt
     *
     * @return float
     */
    public function getLongTermDebt()
    {
        return $this->longTermDebt;
    }

    /**
     * Set totalAssets
     *
     * @param float $totalAssets
     * @return Government
     */
    public function setTotalAssets($totalAssets)
    {
        $this->totalAssets = $totalAssets;

        return $this;
    }

    /**
     * Get totalAssets
     *
     * @return float
     */
    public function getTotalAssets()
    {
        return $this->totalAssets;
    }

    /**
     * Set totalNetPosition
     *
     * @param float $totalNetPosition
     * @return Government
     */
    public function setTotalNetPosition($totalNetPosition)
    {
        $this->totalNetPosition = $totalNetPosition;

        return $this;
    }

    /**
     * Get totalNetPosition
     *
     * @return float
     */
    public function getTotalNetPosition()
    {
        return $this->totalNetPosition;
    }

    /**
     * Set totalUnrestrictedNetPosition
     *
     * @param float $totalUnrestrictedNetPosition
     * @return Government
     */
    public function setTotalUnrestrictedNetPosition($totalUnrestrictedNetPosition)
    {
        $this->totalUnrestrictedNetPosition = $totalUnrestrictedNetPosition;

        return $this;
    }

    /**
     * Get totalUnrestrictedNetPosition
     *
     * @return float
     */
    public function getTotalUnrestrictedNetPosition()
    {
        return $this->totalUnrestrictedNetPosition;
    }

    /**
     * Set generalRevenues
     *
     * @param float $generalRevenues
     * @return Government
     */
    public function setGeneralRevenues($generalRevenues)
    {
        $this->generalRevenues = $generalRevenues;

        return $this;
    }

    /**
     * Get generalRevenues
     *
     * @return float
     */
    public function getGeneralRevenues()
    {
        return $this->generalRevenues;
    }

    /**
     * Set changeInNetAssets
     *
     * @param float $changeInNetAssets
     * @return Government
     */
    public function setChangeInNetAssets($changeInNetAssets)
    {
        $this->changeInNetAssets = $changeInNetAssets;

        return $this;
    }

    /**
     * Get changeInNetAssets
     *
     * @return float
     */
    public function getChangeInNetAssets()
    {
        return $this->changeInNetAssets;
    }

    /**
     * Set generalFundRevenues
     *
     * @param float $generalFundRevenues
     * @return Government
     */
    public function setGeneralFundRevenues($generalFundRevenues)
    {
        $this->generalFundRevenues = $generalFundRevenues;

        return $this;
    }

    /**
     * Get generalFundRevenues
     *
     * @return float
     */
    public function getGeneralFundRevenues()
    {
        return $this->generalFundRevenues;
    }

    /**
     * Set governmentalFundExpenditures
     *
     * @param float $governmentalFundExpenditures
     * @return Government
     */
    public function setGovernmentalFundExpenditures($governmentalFundExpenditures)
    {
        $this->governmentalFundExpenditures = $governmentalFundExpenditures;

        return $this;
    }

    /**
     * Get governmentalFundExpenditures
     *
     * @return float
     */
    public function getGovernmentalFundExpenditures()
    {
        return $this->governmentalFundExpenditures;
    }

    /**
     * Set generalFundSurplus
     *
     * @param float $generalFundSurplus
     * @return Government
     */
    public function setGeneralFundSurplus($generalFundSurplus)
    {
        $this->generalFundSurplus = $generalFundSurplus;

        return $this;
    }

    /**
     * Get generalFundSurplus
     *
     * @return float
     */
    public function getGeneralFundSurplus()
    {
        return $this->generalFundSurplus;
    }

    /**
     * Set netChangeInGeneralFundBalance
     *
     * @param float $netChangeInGeneralFundBalance
     * @return Government
     */
    public function setNetChangeInGeneralFundBalance($netChangeInGeneralFundBalance)
    {
        $this->netChangeInGeneralFundBalance = $netChangeInGeneralFundBalance;

        return $this;
    }

    /**
     * Get netChangeInGeneralFundBalance
     *
     * @return float
     */
    public function getNetChangeInGeneralFundBalance()
    {
        return $this->netChangeInGeneralFundBalance;
    }

    /**
     * Set generalFundBalance
     *
     * @param float $generalFundBalance
     * @return Government
     */
    public function setGeneralFundBalance($generalFundBalance)
    {
        $this->generalFundBalance = $generalFundBalance;

        return $this;
    }

    /**
     * Get generalFundBalance
     *
     * @return float
     */
    public function getGeneralFundBalance()
    {
        return $this->generalFundBalance;
    }

    /**
     * Set debtServiceExpendituresAllFunds
     *
     * @param float $debtServiceExpendituresAllFunds
     * @return Government
     */
    public function setDebtServiceExpendituresAllFunds($debtServiceExpendituresAllFunds)
    {
        $this->debtServiceExpendituresAllFunds = $debtServiceExpendituresAllFunds;

        return $this;
    }

    /**
     * Get debtServiceExpendituresAllFunds
     *
     * @return float
     */
    public function getDebtServiceExpendituresAllFunds()
    {
        return $this->debtServiceExpendituresAllFunds;
    }

    /**
     * Set intergovernmentalFundsGf
     *
     * @param float $intergovernmentalFundsGf
     * @return Government
     */
    public function setIntergovernmentalFundsGf($intergovernmentalFundsGf)
    {
        $this->intergovernmentalFundsGf = $intergovernmentalFundsGf;

        return $this;
    }

    /**
     * Get intergovernmentalFundsGf
     *
     * @return float
     */
    public function getIntergovernmentalFundsGf()
    {
        return $this->intergovernmentalFundsGf;
    }

    /**
     * Set governmentFundsOverallBalance
     *
     * @param float $governmentFundsOverallBalance
     * @return Government
     */
    public function setGovernmentFundsOverallBalance($governmentFundsOverallBalance)
    {
        $this->governmentFundsOverallBalance = $governmentFundsOverallBalance;

        return $this;
    }

    /**
     * Get governmentFundsOverallBalance
     *
     * @return float
     */
    public function getGovernmentFundsOverallBalance()
    {
        return $this->governmentFundsOverallBalance;
    }

    /**
     * Set netChangeInFundBalanceOverGeneralFundRevenue
     *
     * @param float $netChangeInFundBalanceOverGeneralFundRevenue
     * @return Government
     */
    public function setNetChangeInFundBalanceOverGeneralFundRevenue($netChangeInFundBalanceOverGeneralFundRevenue)
    {
        $this->netChangeInFundBalanceOverGeneralFundRevenue = $netChangeInFundBalanceOverGeneralFundRevenue;

        return $this;
    }

    /**
     * Get netChangeInFundBalanceOverGeneralFundRevenue
     *
     * @return float
     */
    public function getNetChangeInFundBalanceOverGeneralFundRevenue()
    {
        return $this->netChangeInFundBalanceOverGeneralFundRevenue;
    }

    /**
     * Set netChangeInFundBalanceOverGeneralFundRevenueRank
     *
     * @param integer $netChangeInFundBalanceOverGeneralFundRevenueRank
     * @return Government
     */
    public function setNetChangeInFundBalanceOverGeneralFundRevenueRank($netChangeInFundBalanceOverGeneralFundRevenueRank)
    {
        $this->netChangeInFundBalanceOverGeneralFundRevenueRank = $netChangeInFundBalanceOverGeneralFundRevenueRank;

        return $this;
    }

    /**
     * Get netChangeInFundBalanceOverGeneralFundRevenueRank
     *
     * @return integer
     */
    public function getNetChangeInFundBalanceOverGeneralFundRevenueRank()
    {
        return $this->netChangeInFundBalanceOverGeneralFundRevenueRank;
    }

    /**
     * Set generalFundBalanceOverGeneralFundExpenditures
     *
     * @param float $generalFundBalanceOverGeneralFundExpenditures
     * @return Government
     */
    public function setGeneralFundBalanceOverGeneralFundExpenditures($generalFundBalanceOverGeneralFundExpenditures)
    {
        $this->generalFundBalanceOverGeneralFundExpenditures = $generalFundBalanceOverGeneralFundExpenditures;

        return $this;
    }

    /**
     * Get generalFundBalanceOverGeneralFundExpenditures
     *
     * @return float
     */
    public function getGeneralFundBalanceOverGeneralFundExpenditures()
    {
        return $this->generalFundBalanceOverGeneralFundExpenditures;
    }

    /**
     * Set generalFundBalanceOverGeneralFundExpendituresRank
     *
     * @param integer $generalFundBalanceOverGeneralFundExpendituresRank
     * @return Government
     */
    public function setGeneralFundBalanceOverGeneralFundExpendituresRank($generalFundBalanceOverGeneralFundExpendituresRank)
    {
        $this->generalFundBalanceOverGeneralFundExpendituresRank = $generalFundBalanceOverGeneralFundExpendituresRank;

        return $this;
    }

    /**
     * Get generalFundBalanceOverGeneralFundExpendituresRank
     *
     * @return integer
     */
    public function getGeneralFundBalanceOverGeneralFundExpendituresRank()
    {
        return $this->generalFundBalanceOverGeneralFundExpendituresRank;
    }

    /**
     * Set currentAssetsPerCapita
     *
     * @param float $currentAssetsPerCapita
     * @return Government
     */
    public function setCurrentAssetsPerCapita($currentAssetsPerCapita)
    {
        $this->currentAssetsPerCapita = $currentAssetsPerCapita;

        return $this;
    }

    /**
     * Get currentAssetsPerCapita
     *
     * @return float
     */
    public function getCurrentAssetsPerCapita()
    {
        return $this->currentAssetsPerCapita;
    }

    /**
     * Set currentAssetsPerCapitaRank
     *
     * @param integer $currentAssetsPerCapitaRank
     * @return Government
     */
    public function setCurrentAssetsPerCapitaRank($currentAssetsPerCapitaRank)
    {
        $this->currentAssetsPerCapitaRank = $currentAssetsPerCapitaRank;

        return $this;
    }

    /**
     * Get currentAssetsPerCapitaRank
     *
     * @return integer
     */
    public function getCurrentAssetsPerCapitaRank()
    {
        return $this->currentAssetsPerCapitaRank;
    }

    /**
     * Set currentAssetsOverCurrentLiabilities
     *
     * @param float $currentAssetsOverCurrentLiabilities
     * @return Government
     */
    public function setCurrentAssetsOverCurrentLiabilities($currentAssetsOverCurrentLiabilities)
    {
        $this->currentAssetsOverCurrentLiabilities = $currentAssetsOverCurrentLiabilities;

        return $this;
    }

    /**
     * Get currentAssetsOverCurrentLiabilities
     *
     * @return float
     */
    public function getCurrentAssetsOverCurrentLiabilities()
    {
        return $this->currentAssetsOverCurrentLiabilities;
    }

    /**
     * Set currentAssetsOverCurrentLiabilitiesRank
     *
     * @param integer $currentAssetsOverCurrentLiabilitiesRank
     * @return Government
     */
    public function setCurrentAssetsOverCurrentLiabilitiesRank($currentAssetsOverCurrentLiabilitiesRank)
    {
        $this->currentAssetsOverCurrentLiabilitiesRank = $currentAssetsOverCurrentLiabilitiesRank;

        return $this;
    }

    /**
     * Get currentAssetsOverCurrentLiabilitiesRank
     *
     * @return integer
     */
    public function getCurrentAssetsOverCurrentLiabilitiesRank()
    {
        return $this->currentAssetsOverCurrentLiabilitiesRank;
    }

    /**
     * Set longTermDebtOverCapita
     *
     * @param float $longTermDebtOverCapita
     * @return Government
     */
    public function setLongTermDebtOverCapita($longTermDebtOverCapita)
    {
        $this->longTermDebtOverCapita = $longTermDebtOverCapita;

        return $this;
    }

    /**
     * Get longTermDebtOverCapita
     *
     * @return float
     */
    public function getLongTermDebtOverCapita()
    {
        return $this->longTermDebtOverCapita;
    }

    /**
     * Set longTermDebtOverCapitaRank
     *
     * @param integer $longTermDebtOverCapitaRank
     * @return Government
     */
    public function setLongTermDebtOverCapitaRank($longTermDebtOverCapitaRank)
    {
        $this->longTermDebtOverCapitaRank = $longTermDebtOverCapitaRank;

        return $this;
    }

    /**
     * Get longTermDebtOverCapitaRank
     *
     * @return integer
     */
    public function getLongTermDebtOverCapitaRank()
    {
        return $this->longTermDebtOverCapitaRank;
    }

    /**
     * Set generalRevenuesOverLongTermDebt
     *
     * @param float $generalRevenuesOverLongTermDebt
     * @return Government
     */
    public function setGeneralRevenuesOverLongTermDebt($generalRevenuesOverLongTermDebt)
    {
        $this->generalRevenuesOverLongTermDebt = $generalRevenuesOverLongTermDebt;

        return $this;
    }

    /**
     * Get generalRevenuesOverLongTermDebt
     *
     * @return float
     */
    public function getGeneralRevenuesOverLongTermDebt()
    {
        return $this->generalRevenuesOverLongTermDebt;
    }

    /**
     * Set generalRevenuesOverLongTermDebtRank
     *
     * @param integer $generalRevenuesOverLongTermDebtRank
     * @return Government
     */
    public function setGeneralRevenuesOverLongTermDebtRank($generalRevenuesOverLongTermDebtRank)
    {
        $this->generalRevenuesOverLongTermDebtRank = $generalRevenuesOverLongTermDebtRank;

        return $this;
    }

    /**
     * Get generalRevenuesOverLongTermDebtRank
     *
     * @return integer
     */
    public function getGeneralRevenuesOverLongTermDebtRank()
    {
        return $this->generalRevenuesOverLongTermDebtRank;
    }

    /**
     * Set debtServiceExpendituresOverGeneralFundRevenues
     *
     * @param float $debtServiceExpendituresOverGeneralFundRevenues
     * @return Government
     */
    public function setDebtServiceExpendituresOverGeneralFundRevenues($debtServiceExpendituresOverGeneralFundRevenues)
    {
        $this->debtServiceExpendituresOverGeneralFundRevenues = $debtServiceExpendituresOverGeneralFundRevenues;

        return $this;
    }

    /**
     * Get debtServiceExpendituresOverGeneralFundRevenues
     *
     * @return float
     */
    public function getDebtServiceExpendituresOverGeneralFundRevenues()
    {
        return $this->debtServiceExpendituresOverGeneralFundRevenues;
    }

    /**
     * Set debtServiceExpendituresOverGeneralFundRevenuesRank
     *
     * @param integer $debtServiceExpendituresOverGeneralFundRevenuesRank
     * @return Government
     */
    public function setDebtServiceExpendituresOverGeneralFundRevenuesRank($debtServiceExpendituresOverGeneralFundRevenuesRank)
    {
        $this->debtServiceExpendituresOverGeneralFundRevenuesRank = $debtServiceExpendituresOverGeneralFundRevenuesRank;

        return $this;
    }

    /**
     * Get debtServiceExpendituresOverGeneralFundRevenuesRank
     *
     * @return integer
     */
    public function getDebtServiceExpendituresOverGeneralFundRevenuesRank()
    {
        return $this->debtServiceExpendituresOverGeneralFundRevenuesRank;
    }

    /**
     * Set generalFundSurplusOverRevenues
     *
     * @param float $generalFundSurplusOverRevenues
     * @return Government
     */
    public function setGeneralFundSurplusOverRevenues($generalFundSurplusOverRevenues)
    {
        $this->generalFundSurplusOverRevenues = $generalFundSurplusOverRevenues;

        return $this;
    }

    /**
     * Get generalFundSurplusOverRevenues
     *
     * @return float
     */
    public function getGeneralFundSurplusOverRevenues()
    {
        return $this->generalFundSurplusOverRevenues;
    }

    /**
     * Set generalFundSurplusOverRevenuesRank
     *
     * @param integer $generalFundSurplusOverRevenuesRank
     * @return Government
     */
    public function setGeneralFundSurplusOverRevenuesRank($generalFundSurplusOverRevenuesRank)
    {
        $this->generalFundSurplusOverRevenuesRank = $generalFundSurplusOverRevenuesRank;

        return $this;
    }

    /**
     * Get generalFundSurplusOverRevenuesRank
     *
     * @return integer
     */
    public function getGeneralFundSurplusOverRevenuesRank()
    {
        return $this->generalFundSurplusOverRevenuesRank;
    }

    /**
     * Set changeInNetAssetsOverGeneralFundRevenues
     *
     * @param float $changeInNetAssetsOverGeneralFundRevenues
     * @return Government
     */
    public function setChangeInNetAssetsOverGeneralFundRevenues($changeInNetAssetsOverGeneralFundRevenues)
    {
        $this->changeInNetAssetsOverGeneralFundRevenues = $changeInNetAssetsOverGeneralFundRevenues;

        return $this;
    }

    /**
     * Get changeInNetAssetsOverGeneralFundRevenues
     *
     * @return float
     */
    public function getChangeInNetAssetsOverGeneralFundRevenues()
    {
        return $this->changeInNetAssetsOverGeneralFundRevenues;
    }

    /**
     * Set changeInNetAssetsOverGeneralFundRevenuesRank
     *
     * @param integer $changeInNetAssetsOverGeneralFundRevenuesRank
     * @return Government
     */
    public function setChangeInNetAssetsOverGeneralFundRevenuesRank($changeInNetAssetsOverGeneralFundRevenuesRank)
    {
        $this->changeInNetAssetsOverGeneralFundRevenuesRank = $changeInNetAssetsOverGeneralFundRevenuesRank;

        return $this;
    }

    /**
     * Get changeInNetAssetsOverGeneralFundRevenuesRank
     *
     * @return integer
     */
    public function getChangeInNetAssetsOverGeneralFundRevenuesRank()
    {
        return $this->changeInNetAssetsOverGeneralFundRevenuesRank;
    }

    /**
     * Set governmentFundsOverallBalancePerCapita
     *
     * @param float $governmentFundsOverallBalancePerCapita
     * @return Government
     */
    public function setGovernmentFundsOverallBalancePerCapita($governmentFundsOverallBalancePerCapita)
    {
        $this->governmentFundsOverallBalancePerCapita = $governmentFundsOverallBalancePerCapita;

        return $this;
    }

    /**
     * Get governmentFundsOverallBalancePerCapita
     *
     * @return float
     */
    public function getGovernmentFundsOverallBalancePerCapita()
    {
        return $this->governmentFundsOverallBalancePerCapita;
    }

    /**
     * Set governmentFundsOverallBalancePerCapitaRank
     *
     * @param integer $governmentFundsOverallBalancePerCapitaRank
     * @return Government
     */
    public function setGovernmentFundsOverallBalancePerCapitaRank($governmentFundsOverallBalancePerCapitaRank)
    {
        $this->governmentFundsOverallBalancePerCapitaRank = $governmentFundsOverallBalancePerCapitaRank;

        return $this;
    }

    /**
     * Get governmentFundsOverallBalancePerCapitaRank
     *
     * @return integer
     */
    public function getGovernmentFundsOverallBalancePerCapitaRank()
    {
        return $this->governmentFundsOverallBalancePerCapitaRank;
    }

    /**
     * Set overallGovernmentalFundBalanceOverLongTermLiabs
     *
     * @param float $overallGovernmentalFundBalanceOverLongTermLiabs
     * @return Government
     */
    public function setOverallGovernmentalFundBalanceOverLongTermLiabs($overallGovernmentalFundBalanceOverLongTermLiabs)
    {
        $this->overallGovernmentalFundBalanceOverLongTermLiabs = $overallGovernmentalFundBalanceOverLongTermLiabs;

        return $this;
    }

    /**
     * Get overallGovernmentalFundBalanceOverLongTermLiabs
     *
     * @return float
     */
    public function getOverallGovernmentalFundBalanceOverLongTermLiabs()
    {
        return $this->overallGovernmentalFundBalanceOverLongTermLiabs;
    }

    /**
     * Set overallGovernmentalFundBalanceOverLongTermLiabsRank
     *
     * @param integer $overallGovernmentalFundBalanceOverLongTermLiabsRank
     * @return Government
     */
    public function setOverallGovernmentalFundBalanceOverLongTermLiabsRank($overallGovernmentalFundBalanceOverLongTermLiabsRank)
    {
        $this->overallGovernmentalFundBalanceOverLongTermLiabsRank = $overallGovernmentalFundBalanceOverLongTermLiabsRank;

        return $this;
    }

    /**
     * Get overallGovernmentalFundBalanceOverLongTermLiabsRank
     *
     * @return integer
     */
    public function getOverallGovernmentalFundBalanceOverLongTermLiabsRank()
    {
        return $this->overallGovernmentalFundBalanceOverLongTermLiabsRank;
    }

    /**
     * Set intergovermentalRevenuesOverGeneralFundRevenues
     *
     * @param float $intergovermentalRevenuesOverGeneralFundRevenues
     * @return Government
     */
    public function setIntergovermentalRevenuesOverGeneralFundRevenues($intergovermentalRevenuesOverGeneralFundRevenues)
    {
        $this->intergovermentalRevenuesOverGeneralFundRevenues = $intergovermentalRevenuesOverGeneralFundRevenues;

        return $this;
    }

    /**
     * Get intergovermentalRevenuesOverGeneralFundRevenues
     *
     * @return float
     */
    public function getIntergovermentalRevenuesOverGeneralFundRevenues()
    {
        return $this->intergovermentalRevenuesOverGeneralFundRevenues;
    }

    /**
     * Set intergovermentalRevenuesOverGeneralFundRevenuesRank
     *
     * @param integer $intergovermentalRevenuesOverGeneralFundRevenuesRank
     * @return Government
     */
    public function setIntergovermentalRevenuesOverGeneralFundRevenuesRank($intergovermentalRevenuesOverGeneralFundRevenuesRank)
    {
        $this->intergovermentalRevenuesOverGeneralFundRevenuesRank = $intergovermentalRevenuesOverGeneralFundRevenuesRank;

        return $this;
    }

    /**
     * Get intergovermentalRevenuesOverGeneralFundRevenuesRank
     *
     * @return integer
     */
    public function getIntergovermentalRevenuesOverGeneralFundRevenuesRank()
    {
        return $this->intergovermentalRevenuesOverGeneralFundRevenuesRank;
    }

    /**
     * Set totalUnrestrictedNetPositionOverTotalAssets
     *
     * @param float $totalUnrestrictedNetPositionOverTotalAssets
     * @return Government
     */
    public function setTotalUnrestrictedNetPositionOverTotalAssets($totalUnrestrictedNetPositionOverTotalAssets)
    {
        $this->totalUnrestrictedNetPositionOverTotalAssets = $totalUnrestrictedNetPositionOverTotalAssets;

        return $this;
    }

    /**
     * Get totalUnrestrictedNetPositionOverTotalAssets
     *
     * @return float
     */
    public function getTotalUnrestrictedNetPositionOverTotalAssets()
    {
        return $this->totalUnrestrictedNetPositionOverTotalAssets;
    }

    /**
     * Set totalUnrestrictedNetPositionOverTotalAssetsRank
     *
     * @param integer $totalUnrestrictedNetPositionOverTotalAssetsRank
     * @return Government
     */
    public function setTotalUnrestrictedNetPositionOverTotalAssetsRank($totalUnrestrictedNetPositionOverTotalAssetsRank)
    {
        $this->totalUnrestrictedNetPositionOverTotalAssetsRank = $totalUnrestrictedNetPositionOverTotalAssetsRank;

        return $this;
    }

    /**
     * Get totalUnrestrictedNetPositionOverTotalAssetsRank
     *
     * @return integer
     */
    public function getTotalUnrestrictedNetPositionOverTotalAssetsRank()
    {
        return $this->totalUnrestrictedNetPositionOverTotalAssetsRank;
    }

    /**
     * Set overallWeightedIndexRank
     *
     * @param integer $overallWeightedIndexRank
     * @return Government
     */
    public function setOverallWeightedIndexRank($overallWeightedIndexRank)
    {
        $this->overallWeightedIndexRank = $overallWeightedIndexRank;

        return $this;
    }

    /**
     * Get overallWeightedIndexRank
     *
     * @return integer
     */
    public function getOverallWeightedIndexRank()
    {
        return $this->overallWeightedIndexRank;
    }

    /**
     * Set legendOverallRanking
     *
     * @param string $legendOverallRanking
     * @return Government
     */
    public function setLegendOverallRanking($legendOverallRanking)
    {
        $this->legendOverallRanking = $legendOverallRanking;

        return $this;
    }

    /**
     * Get legendOverallRanking
     *
     * @return string
     */
    public function getLegendOverallRanking()
    {
        return $this->legendOverallRanking;
    }

    /**
     * @return string
     */
    public function getPavementConditionIndexRank()
    {
        return $this->pavementConditionIndexRank;
    }

    /**
     * @param string $pavementConditionIndexRank
     */
    public function setPavementConditionIndexRank($pavementConditionIndexRank)
    {
        $this->pavementConditionIndexRank = $pavementConditionIndexRank;
    }
}
