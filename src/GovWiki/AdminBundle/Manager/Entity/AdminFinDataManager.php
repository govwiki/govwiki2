<?php

namespace GovWiki\AdminBundle\Manager\Entity;

use GovWiki\AdminBundle\Manager\AbstractAdminEntityManager;
use GovWiki\DbBundle\Entity\FinData;
use GovWiki\DbBundle\Entity\Repository\CategoryRepository;
use GovWiki\DbBundle\Entity\Category;
use GovWiki\DbBundle\Entity\Repository\FinDataRepository;

/**
 * Class AdminFinDataManager
 * @package GovWiki\AdminBundle\Manager
 */
class AdminFinDataManager extends AbstractAdminEntityManager
{
    /**
     * {@inheritdoc}
     */
    protected function getEntityClassName()
    {
        return 'GovWiki\DbBundle\Entity\FinData';
    }

    /**
     * Get list of available years for given governments.
     *
     * @param integer $government Government id
     *
     * @return array
     */
    public function getYears($government)
    {
        /** @var FinDataRepository $repository */
        $repository = $this->getRepository();
        return $repository->getAvailableYears($government);
    }

    /**
     * @param integer $government Government id.
     * @param integer $year       That year's of data to show. If null - show
     *                            for latest.
     *
     * @return FinData
     */
    public function getListQuery($government, $year = null)
    {
        $qb = $this->createQueryBuilder('FinData');
        $expr = $qb->expr();

        $qb
            ->select('FinData, CaptionCategory, Fund')
            ->leftJoin('FinData.captionCategory', 'CaptionCategory')
            ->leftJoin('FinData.fund', 'Fund')
            ->where($expr->eq('FinData.government', $government));

        if (null === $year) {
            /*
             * Query for fetching latest year.
             */
            $latestYear = $this->createQuery('
                SELECT FinData2.year
                FROM GovWikiDbBundle:FinData FinData2
                GROUP BY FinData2.year
                ORDER BY FinData2.year DESC
            ')
                ->setMaxResults(1)
                ->getSingleScalarResult();

            $qb->andWhere($expr->eq('FinData.year', $latestYear));
        } else {
            $qb->andWhere($expr->eq('FinData.year', $year));
        }

        return $qb->getQuery();
    }

    /**
     * @return Category
     */
    public function create()
    {
        $tab = new Category();
        $tab->setEnvironment($this->getEnvironmentReference());

        return $tab;
    }

    /**
     * @param Category $tab A Category instance.
     *
     * @return void
     */
    public function pullUp(Category $tab)
    {
        /** @var CategoryRepository $repository */
        $repository = $this->getRepository();

        $tab->setOrderNumber($repository->getPreviousOrderNumber(
            $this->environment,
            $tab->getOrderNumber()
        ));

        $this->update($tab);
    }

    /**
     * @param Category $tab A Category instance.
     *
     * @return void
     */
    public function pullDown(Category $tab)
    {
        /** @var CategoryRepository $repository */
        $repository = $this->getRepository();

        $tab->setOrderNumber($repository->getNextOrderNumber(
            $this->environment,
            $tab->getOrderNumber()
        ));

        $this->update($tab);
    }
}
