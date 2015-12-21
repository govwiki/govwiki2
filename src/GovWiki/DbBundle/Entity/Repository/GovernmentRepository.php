<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query;
use Doctrine\ORM\Query\Expr\Join;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\Government;

/**
 * GovernmentRepository
 */
class GovernmentRepository extends EntityRepository
{
    /**
     * @param string  $environment Environment name.
     * @param integer $id          Government id.
     * @param string  $name        Government name.
     *
     * @return Query
     */
    public function getListQuery($environment, $id = null, $name = null)
    {
        $qb = $this
            ->createQueryBuilder('Government')
            ->leftJoin('Government.environment', 'Environment');

        $expr = $qb->expr();

        $qb->where($expr->eq('Environment.slug', $expr->literal($environment)));

        if (null !== $id) {
            $qb->andWhere($expr->eq('Government.id', $id));
        }
        if (null !== $name) {
            $qb->andWhere($expr->like(
                'Government.name',
                $expr->literal('%'.$name.'%')
            ));
        }

        return $qb->getQuery();
    }
//    /**
//     * @param string $altTypeSlug Government slugged alt type.
//     *
//     * @return integer
//     */
//    public function countGovernments($altTypeSlug)
//    {
//        $qb = $this->createQueryBuilder('Government');
//        return $qb
//            ->select($qb->expr()->count('Government.id'))
//            ->where(
//                $qb->expr()->eq(
//                    'Government.altTypeSlug',
//                    $qb->expr()->literal($altTypeSlug)
//                )
//            )
//            ->getQuery()
//            ->getSingleScalarResult();
//    }

//    /**
//     * @param string  $altTypeSlug Government slugged alt type.
//     * @param integer $page        Page to show.
//     * @param integer $limit       Max entities per page.
//     * @param array   $orderFields Assoc array, fields name as key and
//     *                             sort direction ('desc' or 'asc' (default))
//     *                             as value.
//     *
//     * @return string[]
//     */
//    public function getGovernments($altTypeSlug, $page, $limit, array $orderFields = [])
//    {
//        $qb = $this->createQueryBuilder('Government');
//        $qb
//            ->select('Government.name, Government.altTypeSlug, Government.slug')
//            ->where(
//                $qb->expr()->eq(
//                    'Government.altTypeSlug',
//                    $qb->expr()->literal($altTypeSlug)
//                )
//            )
//            ->setFirstResult($page * $limit)
//            ->setMaxResults($limit);
//
//        /*
//        * Get all class property with 'Rank' postfix.
//        */
//        foreach ($this->getClassMetadata()->columnNames as $key => $value) {
//            if (false !== strpos($key, 'Rank')) {
//                $qb->addSelect("Government.$key");
//            }
//        }
//
//        if ($orderFields) {
//            foreach ($orderFields as $fieldName => $direction) {
//                $fieldName .= 'Rank';
//                if ('desc' === $direction) {
//                    $qb->addOrderBy($qb->expr()->desc('Government.'. $fieldName));
//                } else {
//                    $qb->addOrderBy($qb->expr()->asc('Government.'. $fieldName));
//                }
//            }
//        }
//
//        $data = $qb
//            ->getQuery()
//            ->getArrayResult();
//
//        /*
//         * Remove empty fields.
//         */
//        foreach ($data as &$row) {
//            foreach ($row as $key => $field) {
//                if (empty($field)) {
//                    unset($row[$key]);
//                }
//            }
//        }
//
//        return $data;
//    }

    /**
     * @param string  $environment    Environment name.
     * @param string  $altTypeSlug    Slugged alt type.
     * @param string  $governmentSlug Slugged government name.
     * @param string  $rankFieldName  One of government rank field name.
     * @param integer $limit          Max result per page.
     * @param integer $page           Page index, start from 0.
     * @param string  $order          Sorting order by $rankFieldName 'desc' or 'asc'.
     *                                If null start from given entity.
     * @param string  $nameOrder      Sorting order by government name 'desc' or 'asc'.
     *                                If null start from given entity.
     *
     * @return array
     */
    public function getGovernmentRank($environment, $altTypeSlug, $governmentSlug, $rankFieldName, $limit, $page = 0, $order = null, $nameOrder = null)
    {
        /*
         * Remove rank postfix from field name, in order to get
         * concrete amount field name.
         */
        $amountFieldName = str_replace('Rank', '', $rankFieldName);

        $qb = $this->createQueryBuilder('Government');
        $expr = $qb->expr();

        $qb
            ->select(
                "Government.slug as name, Government.$rankFieldName AS value, Government.$amountFieldName as amount"
            )
            ->leftJoin('Government.environment', 'Environment')
            ->where(
                $expr->andX(
                    $expr->eq(
                        'Government.altTypeSlug',
                        $expr->literal($altTypeSlug)
                    ),
                    $expr->eq('Environment.slug', $expr->literal($environment))
                )
            );

        /*
         * Get list of rank started from given government.
         */
        if (empty($order)) {
            /*
             * Get rank for given government.
             */
            $qb2 = $this->createQueryBuilder('Government');
            $expr2 = $qb2->expr();

            $rank = $qb2
                ->select('Government.'. $rankFieldName)
                ->leftJoin('Government.environment', 'Environment')
                ->where(
                    $expr2->andX(
                        $expr2->eq(
                            'Government.altTypeSlug',
                            $expr2->literal($altTypeSlug)
                        ),
                        $expr2->eq(
                            'Government.slug',
                            $expr2->literal($governmentSlug)
                        ),
                        $expr2->eq(
                            'Environment.slug',
                            $expr2->literal($environment)
                        )
                    )
                )
                ->orderBy($qb2->expr()->asc('Government.'. $rankFieldName))
                ->getQuery()
                ->getSingleScalarResult();


            $qb->andWhere(
                $expr->gte('Government.'. $rankFieldName, $rank)
            );
            if (empty($nameOrder)) {
                $qb->orderBy($expr->asc('Government.' . $rankFieldName));
            }

        /*
         * Get sorted information from offset computed on given page and limit.
         */
        } elseif ('desc' === $order) {
            $qb->orderBy($expr->desc('Government.'. $rankFieldName));
        } elseif ('asc' === $order) {
            $qb->orderBy($expr->asc('Government.'. $rankFieldName));
        }

        if ('desc' === $nameOrder) {
            $qb->AddOrderBy($expr->desc('Government.slug'));
        } elseif ('asc' === $nameOrder) {
            $qb->AddOrderBy($expr->asc('Government.slug'));
        }

        return $qb
            ->setFirstResult($page * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getArrayResult();
    }

    /**
     * Find government by slug and altTypeSlug.
     * Append maxRanks and financialStatements.
     *
     * @param string $environment Environment name.
     * @param string $altTypeSlug Slugged government alt type.
     * @param string $slug        Slugged government name.
     *
     * @return Government
     */
    public function findGovernment($environment, $altTypeSlug, $slug)
    {
        $qb = $this->createQueryBuilder('Government');
        $expr = $qb->expr();

        $data = $qb
            ->addSelect(
                'FinData, CaptionCategory, MaxRank, ElectedOfficial',
                'Fund'
            )
            ->leftJoin('Government.finData', 'FinData')
            ->leftJoin('FinData.captionCategory', 'CaptionCategory')
            ->leftJoin('Government.electedOfficials', 'ElectedOfficial')
            ->leftJoin('FinData.fund', 'Fund')
            ->leftJoin('Government.environment', 'Environment')
            ->join(
                'GovWikiDbBundle:MaxRank',
                'MaxRank',
                Join::WITH,
                $expr->eq('MaxRank.altType', 'Government.altType')
            )
            ->where(
                $expr->andX(
                    $expr->eq(
                        'Government.altTypeSlug',
                        $qb->expr()->literal($altTypeSlug)
                    ),
                    $expr->eq(
                        'Government.slug',
                        $qb->expr()->literal($slug)
                    ),
                    $expr->eq('Environment.slug', $expr->literal($environment))
                )
            )
            ->getQuery()
            ->getArrayResult();

        $government = $data[0];

        $financialStatementsGroups = [];
        $finData = $government['finData'];
        foreach ($finData as $finDataItem) {
            $financialStatementsGroups[$finDataItem['caption']][] = $finDataItem;
        }
        $i = 0;
        $financialStatements = [];
        foreach ($financialStatementsGroups as $caption => $finData) {
            foreach ($finData as $finDataItem) {
                $financialStatements[$i]['caption'] = $caption;
                $financialStatements[$i]['category_name'] = $finDataItem['captionCategory']['name'];
                $financialStatements[$i]['display_order'] = $finDataItem['displayOrder'];
                if (empty($financialStatements[$i]['genfund'])) {
                    if (empty($finDataItem['fund'])) {
                        $financialStatements[$i]['genfund'] = $finDataItem['dollarAmount'];
                    } elseif ($finDataItem['fund']['name'] === 'General Fund') {
                        $financialStatements[$i]['genfund'] = $finDataItem['dollarAmount'];
                    }
                }
                if (empty($financialStatements[$i]['otherfunds'])) {
                    if (!empty($finDataItem['fund']) and $finDataItem['fund']['name'] === 'Other') {
                        $financialStatements[$i]['otherfunds'] = $finDataItem['dollarAmount'];
                    }
                }
                if (empty($financialStatements[$i]['totalfunds'])) {
                    if (!empty($finDataItem['fund']) and $finDataItem['fund']['name'] === 'Total') {
                        $financialStatements[$i]['totalfunds'] = $finDataItem['dollarAmount'];
                    }
                }
            }
            $i++;
        }

        unset($government['finData']);

        /*
         * Combine data.
         */

        /*
         * Prepare ranks.
         */
        $ranks = [];
        unset($data[1]['id'], $data[1]['altType']);

        foreach ($data[1] as $key => $maxValue) {
            if (null !== $maxValue) {
                $fieldName = str_replace('Max', '', $key);
                $ranks[$fieldName] = [$government[$fieldName], $maxValue];
            }
        }

        $government['ranks'] = $ranks;
        $government['financialStatements'] = $financialStatements;

        return $government;

//
//          OLD CODE.
//
//        $em = $this->getEntityManager();
//
//        /** @var Government $government */
//        $government = $this->findOneBy(['altTypeSlug' => $altTypeSlug, 'slug' => $slug]);
//        $maxRanks   = $em->getRepository('GovWikiDbBundle:MaxRank')->findOneBy([
//            'altType' => $government->getAltType(),
//        ]);
//
//        $serializedGovernment = $serializer->serialize($government, 'json', SerializationContext::create()->enableMaxDepthChecks());
//        $serializedMaxRanks   = $serializer->serialize($maxRanks, 'json');
//
//        $finData = $em->createQuery(
//            'SELECT fd FROM GovWikiDbBundle:FinData fd
//            LEFT JOIN fd.government g
//            LEFT JOIN fd.captionCategory cc
//            WHERE g = :government
//            ORDER BY cc.id, fd.displayOrder'
//        )->setParameter('government', $government)->getResult();
//        foreach ($finData as $finDataItem) {
//            $financialStatementsGroups[$finDataItem->getCaption()][] = $finDataItem;
//        }
//
//        $i = 0;
//        foreach ($financialStatementsGroups as $caption => $finData) {
//            foreach ($finData as $finDataItem) {
//                $financialStatements[$i]['caption'] = $caption;
//                $financialStatements[$i]['category_name'] = $finDataItem->getCaptionCategory()->getName();
//                $financialStatements[$i]['display_order'] = $finDataItem->getDisplayOrder();
//                if (empty($financialStatements[$i]['genfund'])) {
//                    if (empty($finDataItem->getFund())) {
//                        $financialStatements[$i]['genfund'] = $finDataItem->getDollarAmount();
//                    } elseif ($finDataItem->getFund()->getName() == 'General Fund') {
//                        $financialStatements[$i]['genfund'] = $finDataItem->getDollarAmount();
//                    }
//                }
//                if (empty($financialStatements[$i]['otherfunds'])) {
//                    if (!empty($finDataItem->getFund()) and $finDataItem->getFund()->getName() == 'Other') {
//                        $financialStatements[$i]['otherfunds'] = $finDataItem->getDollarAmount();
//                    }
//                }
//                if (empty($financialStatements[$i]['totalfunds'])) {
//                    if (!empty($finDataItem->getFund()) and $finDataItem->getFund()->getName() == 'Total') {
//                        $financialStatements[$i]['totalfunds'] = $finDataItem->getDollarAmount();
//                    }
//                }
//            }
//            $i++;
//        }
//
//        $decoded                         = json_decode($serializedGovernment, true);
//        $decoded['financial_statements'] = $financialStatements;
//        $decoded['max_ranks']            = json_decode($serializedMaxRanks, true);
//        $serializedGovernment            = json_encode($decoded);
//
//        return $serializedGovernment;
    }

    /**
     * Get markers for map.
     *
     * @param  array   $altTypes Ignored altTypes.
     * @param  integer $limit    Max Markers.
     * @return array
     */
    public function getMarkers($altTypes, $limit = 200)
    {
        $qb = $this->createQueryBuilder('g')
            ->select('g.id', 'g.name', 'g.altType', 'g.type', 'g.city', 'g.zip', 'g.state', 'g.latitude', 'g.longitude', 'g.altTypeSlug', 'g.slug');
//            ->where('g.altType != :altType')
//            ->setParameter('altType', $altTypes);

        if (!empty($altTypes)) {
            $orX = $qb->expr()->orX();
            $parameters = [];
            foreach ($altTypes as $key => $type) {
                if ($type != 'Special District') {
                    $orX->add($qb->expr()->eq('g.altType', ':altType'.$key));
                    $parameters['altType'.$key]  = $type;
                }
            }
//            $parameters['altType'] = 'County';
            $qb->andWhere($orX)->setParameters($parameters);
        }

        $result = $qb->setMaxResults($limit)->orderBy('g.rand', 'ASC')->getQuery()->getArrayResult();

        if (!empty($altTypes) && in_array('Special District', $altTypes)) {
            $specialDistricts = $this->fetchSpecialDistricts();
            $result = array_merge($result, $specialDistricts);
        }

        return $result;
    }

    /**
     * Get list of all elected officials from government by one of
     * elected official.
     *
     * @param integer $id Elected official id.
     *
     * @return ElectedOfficial[]
     */
    public function governmentElectedOfficial($id)
    {
        $qb2 = $this->createQueryBuilder('Gov2');
        $qb2
            ->select('Gov2.id')
            ->join('Gov2.electedOfficials', 'EO2')
            ->where(
                $qb2->expr()->eq('EO2.id', $id)
            );

        $qb = $this->getEntityManager()->createQueryBuilder();
        return $qb
            ->from('GovWikiDbBundle:ElectedOfficial', 'EO')
            ->select('EO.id, EO.fullName')
            ->where(
                $qb->expr()->in('EO.government', $qb2->getDQL())
            )
            ->getQuery()
            ->getResult();
    }

    /**
     * Compute max ranks for given alt type.
     *
     * @param string $altType One of the government alt type.
     *
     * @return array
     */
    public function computeMaxRanks($altType)
    {
        $qb = $this->createQueryBuilder('Government');

        /*
         * Get all class property with 'Rank' postfix.
         */
        $fields = [];
        foreach ($this->getClassMetadata()->columnNames as $key => $value) {
            $pos = strpos($key, 'Rank');
            if (false !== $pos) {
                $fields[] = $qb->expr()->max("Government.$key") .
                    ' AS ' . substr($key, 0, $pos) . 'MaxRank';
            }
        }

        $qb
            ->select($fields)
            ->where(
                $qb->expr()->eq(
                    'Government.altType',
                    $qb->expr()->literal($altType)
                )
            );

        return $qb
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * @param string $map Map name.
     *
     * @return array
     */
    public function exportGovernments($map)
    {
        $qb = $this->createQueryBuilder('Government');
        $expr = $qb->expr();

        return $qb
            ->select(
                'partial Government.{id,latitude,longitude,slug,altTypeSlug}'
            )
            ->leftJoin('Government.map', 'Map')
            ->where($expr->eq('Map.name', $expr->literal($map)))
            ->getQuery()
            ->getArrayResult();
    }

    /**
     * @return array
     */
    private function fetchSpecialDistricts()
    {
        $specialDistrictsList  = [
            4378, 4387, 4416, 4427, 4532, 4750, 4917,
            4981, 5204, 5339, 5600, 5618, 5626, 5749,
            5752, 5791, 5871, 5874, 5963, 5983, 5993,
            5995, 6000, 6033, 6070, 6090, 6093, 6544
        ];

        $qb = $this->createQueryBuilder('g')
            ->select('g.id', 'g.name', 'g.altType', 'g.type', 'g.city', 'g.zip', 'g.state', 'g.latitude', 'g.longitude', 'g.altTypeSlug', 'g.slug');

        $orX = $qb->expr()->orX();
        $parameters = [];
        foreach ($specialDistrictsList as $key => $id) {
            $orX->add($qb->expr()->eq('g.id', ':id'.$key));
            $parameters['id'.$key] = $id;
        }

        $qb->andWhere($orX)->setParameters($parameters);

        return $qb->getQuery()->getArrayResult();
    }
}
