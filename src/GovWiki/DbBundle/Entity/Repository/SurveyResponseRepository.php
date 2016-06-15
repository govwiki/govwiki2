<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * SurveyResponseRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class SurveyResponseRepository extends EntityRepository
{

    /**
     * @param integer $elected A ElectedOfficial entity instance.
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    public function getListQuery($elected)
    {
        $expr = $this->_em->getExpressionBuilder();

        return $this->createQueryBuilder('SurveyResponse')
            ->addSelect('Survey')
            ->join('SurveyResponse.survey', 'Survey')
            ->where($expr->eq('SurveyResponse.electedOfficial', ':elected'))
            ->setParameter('elected', $elected);
    }
}