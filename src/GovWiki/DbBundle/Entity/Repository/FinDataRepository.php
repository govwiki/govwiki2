<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;
use GovWiki\DbBundle\Entity\FinData;
use GovWiki\DbBundle\Entity\Environment;

/**
 * FinDataRepository
 */
class FinDataRepository extends EntityRepository
{

    /**
     * @param integer $id FinData id.
     *
     * @return FinData
     *
     * @throws NonUniqueResultException If the query result is not unique.
     * @throws NoResultException If the query returned no result.
     */
    public function get($id)
    {
        $qb = $this->createQueryBuilder('FinData');
        $expr = $qb->expr();

        return $qb
            ->addSelect('CaptionCategory, Fund')
            ->leftJoin('FinData.captionCategory', 'CaptionCategory')
            ->leftJoin('FinData.fund', 'Fund')
            ->where($expr->eq('FinData.id', $id))
            ->getQuery()
            ->getSingleResult();
    }

    public function getAvailableYears($government)
    {
        $qb = $this->createQueryBuilder('FinData');
        $expr = $qb->expr();

        $data = $qb
            ->select('FinData.year')
            ->where($expr->eq('FinData.government', $government))
            ->groupBy('FinData.year')
            ->orderBy($expr->desc('FinData.year'))
            ->getQuery()
            ->getArrayResult();

        $result = [];
        foreach ($data as $row) {
            $result[] = (string) $row['year'];
        }

        return $result;
    }

    /**
     * @param Environment $env Environment.
     *
     * @return array
     */
    public function getUniqueCaptions($env = null)
    {
        $qb = $this->createQueryBuilder('FinData')
            ->select('FinData.caption')
            ->groupBy('FinData.caption');

        if (null !== $env) {
            $qb->leftJoin('FinData.government', 'Government')
                ->leftJoin('Government.environment', 'Environment')
                ->where('Environment = :env')
                ->setParameter('env', $env);
        }

        return $qb->getQuery()->getResult();
    }
}
