<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use GovWiki\DbBundle\Entity\EnvironmentStyles;

/**
 * EnvironmentStylesRepository
 */
class EnvironmentStylesRepository extends EntityRepository
{

    /**
     * @param integer $environment Environment entity id.
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    public function getListQuery($environment)
    {
        $expr = $this->_em->getExpressionBuilder();

        return $this
            ->createQueryBuilder('Style')
            ->where($expr->eq('Style.environment', ':environment'))
            ->setParameter('environment', $environment);
    }

    /**
     * Get list of environment styles.
     *
     * @param integer $environment Environment entity id.
     *
     * @return EnvironmentStyles[]
     */
    public function get($environment)
    {
        return $this->getListQuery($environment)
            ->getQuery()
            ->getResult();
    }

    /**
     * Remove all styles for givern environment.
     *
     * @param integer $environment Environment entity id.
     *
     * @return void
     */
    public function purge($environment)
    {
        $expr = $this->_em->getExpressionBuilder();
        $this->createQueryBuilder('Style')
            ->delete()
            ->where($expr->eq('Style.environment', ':environment'))
            ->setParameter('environment', $environment)
            ->getQuery()
            ->execute();
    }
}
