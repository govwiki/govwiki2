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
     * Get list of environment styles.
     *
     * @param integer $environment Environment entity id.
     * @param string  $type        Style type: desktop or mobile.
     *
     * @return EnvironmentStyles[]
     */
    public function get($environment, $type)
    {
        $expr = $this->_em->getExpressionBuilder();

        return $this
            ->createQueryBuilder('Style')
            ->where($expr->andX(
                $expr->eq('Style.environment', ':environment'),
                $expr->eq('Style.type', ':type')
            ))
            ->setParameters([
                'environment' => $environment,
                'type' => $type,
            ])
            ->getQuery()
            ->getResult();
    }

    /**
     * Remove all styles for given environment.
     *
     * @param integer $environment Environment entity id.
     * @param string  $type        Style type: desktop or mobile.
     *
     * @return void
     */
    public function purge($environment, $type)
    {
        $expr = $this->_em->getExpressionBuilder();
        $this->createQueryBuilder('Style')
            ->delete()
            ->where($expr->andX(
                $expr->eq('Style.environment', ':environment'),
                $expr->eq('Style.type', ':type')
            ))
            ->setParameters([
                'environment' => $environment,
                'type' => $type,
            ])
            ->getQuery()
            ->execute();
    }
}
