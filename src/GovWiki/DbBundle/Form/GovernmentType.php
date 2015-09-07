<?php

namespace GovWiki\DbBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

/**
 * GovernmentType
 */
class GovernmentType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('stateId')
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
            ->add('enrollmentRank')
        ;
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'GovWiki\DbBundle\Entity\Government'
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'government';
    }
}
