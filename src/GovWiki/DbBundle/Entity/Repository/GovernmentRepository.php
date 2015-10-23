<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Expr\Join;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use JMS\Serializer\SerializationContext;

/**
 * GovernmentRepository
 */
class GovernmentRepository extends EntityRepository
{
    /**
     * Find government by slug and altTypeSlug
     * Append maxRanks and financialStatements
     *
     * @param  string                    $altTypeSlug
     * @param  string                    $slug
     * @param  JMS\Serializer\Serializer $serializer
     * @return string serialized json
     */
    public function findGovernment($altTypeSlug, $slug, \JMS\Serializer\Serializer $serializer)
    {
        $em = $this->getEntityManager();

        $government = $this->findOneBy(['altTypeSlug' => $altTypeSlug, 'slug' => $slug]);
        $maxRanks   = $em->getRepository('GovWikiDbBundle:MaxRank')->find(1);

        $serializedGovernment = $serializer->serialize($government, 'json', SerializationContext::create()->enableMaxDepthChecks());
        $serializedMaxRanks   = $serializer->serialize($maxRanks, 'json');

        $finData = $em->createQuery(
            'SELECT fd FROM GovWikiDbBundle:FinData fd
            LEFT JOIN fd.government g
            LEFT JOIN fd.captionCategory cc
            WHERE g = :government
            ORDER BY cc.id, fd.displayOrder'
        )->setParameter('government', $government)->getResult();
        foreach ($finData as $finDataItem) {
            $financialStatementsGroups[$finDataItem->getCaption()][] = $finDataItem;
        }

        $i = 0;
        foreach ($financialStatementsGroups as $caption => $finData) {
            foreach ($finData as $finDataItem) {
                $financialStatements[$i]['caption'] = $caption;
                $financialStatements[$i]['category_name'] = $finDataItem->getCaptionCategory()->getName();
                $financialStatements[$i]['display_order'] = $finDataItem->getDisplayOrder();
                if (empty($financialStatements[$i]['genfund'])) {
                    if (empty($finDataItem->getFund())) {
                        $financialStatements[$i]['genfund'] = $finDataItem->getDollarAmount();
                    } elseif ($finDataItem->getFund()->getName() == 'General Fund') {
                        $financialStatements[$i]['genfund'] = $finDataItem->getDollarAmount();
                    }
                }
                if (empty($financialStatements[$i]['otherfunds'])) {
                    if (!empty($finDataItem->getFund()) and $finDataItem->getFund()->getName() == 'Other') {
                        $financialStatements[$i]['otherfunds'] = $finDataItem->getDollarAmount();
                    }
                }
                if (empty($financialStatements[$i]['totalfunds'])) {
                    if (!empty($finDataItem->getFund()) and $finDataItem->getFund()->getName() == 'Total') {
                        $financialStatements[$i]['totalfunds'] = $finDataItem->getDollarAmount();
                    }
                }
            }
            $i++;
        }

        $decoded                         = json_decode($serializedGovernment, true);
        $decoded['financial_statements'] = $financialStatements;
        $decoded['max_ranks']            = json_decode($serializedMaxRanks, true);
        $serializedGovernment            = json_encode($decoded);

        return $serializedGovernment;
    }

    /**
     * Get markers for map
     *
     * @param  array $altTypes
     * @param  int   $limit
     * @return array
     */
    public function getMarkers($altTypes, $limit = 200)
    {
        $qb = $this->createQueryBuilder('g')
            ->select('g.id', 'g.name', 'g.altType', 'g.type', 'g.city', 'g.zip', 'g.state', 'g.latitude', 'g.longitude', 'g.altTypeSlug', 'g.slug')
            ->where('g.altType != :altType')
            ->setParameter('altType', 'County');

        if (!empty($altTypes)) {
            $orX = $qb->expr()->orX();
            foreach ($altTypes as $key => $type) {
                if ($type != 'Special District') {
                    $orX->add($qb->expr()->eq('g.altType', ':altType'.$key));
                    $parameters['altType'.$key]  = $type;
                }
            }
            $parameters['altType'] = 'County';
            $qb->andWhere($orX)->setParameters($parameters);
        }

        $result = $qb->setMaxResults($limit)->orderBy('g.rand', 'ASC')->getQuery()->getArrayResult();

        if (in_array('Special District', $altTypes)) {
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
        foreach ($specialDistrictsList as $key => $id) {
            $orX->add($qb->expr()->eq('g.id', ':id'.$key));
            $parameters['id'.$key] = $id;
        }

        $qb->andWhere($orX)->setParameters($parameters);

        return $qb->getQuery()->getArrayResult();
    }
}
