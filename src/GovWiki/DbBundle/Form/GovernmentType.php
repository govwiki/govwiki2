<?php

namespace GovWiki\DbBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

/**
 * Class GovernmentType
 * @package GovWiki\DbBundle\Form
 */
class GovernmentType extends AbstractType
{
    /**
     * @var boolean
     */
    private $isEdit;

    /**
     * @param boolean $isEdit Flag, set on edit.
     */
    public function __construct($isEdit = false)
    {
        $this->isEdit = $isEdit;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if ($this->isEdit) {
            $builder->add('environment', 'entity', [
                'class' => 'GovWiki\DbBundle\Entity\Environment',
            ]);
        }

        $builder
            ->add('name')
            ->add('slug')
            ->add('specialDistrictFunctionCode')
            ->add('type')
            ->add('altType')
            ->add('altTypeSlug')
            ->add('censusContact')
            ->add('city')
            ->add('state')
            ->add('zip')
            ->add('webSite')
            ->add('population')
            ->add('populationAsOfYear')
            ->add('enrollment')
            ->add('enrollmentAsOfYear')
            ->add('frpmRate')
            ->add('fipsCounty')
            ->add('fipsPlace')
            ->add('countyAreaName')
            ->add('latitude')
            ->add('longitude')
            ->add('rand')
            ->add('medianWagesGeneralPublic')
            ->add('medianBenefitsGeneralPublic')
            ->add('medianTotalCompGeneralPublic')
            ->add('medianHomePrice')
            ->add('medianSalaryPerFullTimeEmp')
            ->add('medianBenefitsPerFtEmp')
            ->add('medianTotalCompPerFtEmp')
            ->add('medianTotalCompOverMedianIndividualComp')
            ->add('nameOfHighestPaidEmployee')
            ->add('titleOfHighestPaidEmployee')
            ->add('totalCompForHighestPaidEmp')
            ->add('numberOfFullTimeEmployees')
            ->add('fullTimeEmployeesOverPopulation')
            ->add('totalWages')
            ->add('totalSalariesPlusBenefits')
            ->add('pensionContribution')
            ->add('pensionUaal')
            ->add('medianPension30YearRetiree')
            ->add('pensionContributionOverTotalRevenue')
            ->add('formerEmpWithLargestPension')
            ->add('amountOfLargestPension')
            ->add('opebArc')
            ->add('opebActualContribution')
            ->add('opebUaal')
            ->add('opebArcOverTotalRevenue')
            ->add('pensionPlusOpebArcOverTotRev')
            ->add('academicPerformanceIndex')
            ->add('satScores')
            ->add('parentTriggerEligibleSchools')
            ->add('openEnrollmentSchools')
            ->add('violentCrimesPer100000Population')
            ->add('propertyCrimesPer100000Population')
            ->add('pavementConditionIndex')
            ->add('salesTaxRate')
            ->add('libraryHoursPerWeek')
            ->add('graduationRate')
            ->add('dropoutRate')
            ->add('publicSafetyExpOverTotGovFundRevenue')
            ->add('publicSafetyExpOverGeneralFundRevenue')
            ->add('generalFundBalanceOverGeneralFundExp')
            ->add('totalDebtOverTotalRevenue')
            ->add('defaultProbability')
            ->add('totalGovernmentalFundRevenues')
            ->add('totalRevenue')
            ->add('totalRevenuePerCapita')
            ->add('totalGovernmentalFundExpenditures')
            ->add('totalExpenditures')
            ->add('totalExpendituresPerCapita')
            ->add('expenditurePerStudent')
            ->add('gfSurplusOverGfRevenue')
            ->add('changeInGovernmentalFundRevenue')
            ->add('incId')
            ->add('wikipediaPageName')
            ->add('wikipediaPageExists')
            ->add('transparentCaliforniaPageName')
            ->add('latestAuditUrl')
            ->add('frpmRateRank')
            ->add('medianSalaryPerFullTimeEmpRank')
            ->add('medianBenefitsPerFtEmpRank')
            ->add('medianTotalCompPerFtEmpRank')
            ->add('medianTotalCompOverMedianIndividualCompRank')
            ->add('totalCompForHighestPaidEmpRank')
            ->add('fullTimeEmployeesOverPopulationRank')
            ->add('pensionContributionOverTotalRevenueRank')
            ->add('opebArcOverTotalRevenueRank')
            ->add('pensionPlusOpebArcOverTotRevRank')
            ->add('violentCrimesPer100000PopulationRank')
            ->add('propertyCrimesPer100000PopulationRank')
            ->add('academicPerformanceIndexRank')
            ->add('satScoresRank')
            ->add('salesTaxRateRank')
            ->add('libraryHoursPerWeekRank')
            ->add('graduationRateRank')
            ->add('dropoutRateRank')
            ->add('totalDebtOverTotalRevenueRank')
            ->add('expenditurePerStudentRank')
            ->add('generalFundBalanceOverGeneralFundExpRank')
            ->add('gfSurplusOverGfRevenueRank')
            ->add('changeInGovernmentalFundRevenueRank')
            ->add('defaultProbabilityRank')
            ->add('publicSafetyExpOverTotGovFundRevenueRank')
            ->add('publicSafetyExpOverGeneralFundRevenueRank')
            ->add('totalRevenuePerCapitaRank')
            ->add('totalExpendituresPerCapitaRank')
            ->add('medianTotalCompGeneralPublicRank')
            ->add('medianHomePriceRank')
            ->add('populationRank')
            ->add('enrollmentRank');
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'GovWiki\DbBundle\Entity\Government',
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'government';
    }
}
