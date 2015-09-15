<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
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

        $finData = $em->getRepository('GovWikiDbBundle:FinData')->findByGovernment($government);
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
     * @return array
     */
    public function getMarkers($altTypes)
    {
        $qb = $this->createQueryBuilder('g')
            ->select('g.id', 'g.name', 'g.altType', 'g.type', 'g.city', 'g.zip', 'g.state', 'g.latitude', 'g.longitude', 'g.altTypeSlug', 'g.slug')
            ->where('g.altType != :altType')
            ->setParameter('altType', 'County');

        if (!empty($altTypes)) {
            $orX = $qb->expr()->orX();
            foreach ($altTypes as $key => $type) {
                $orX->add($qb->expr()->eq('g.altType', ':altType'.$key));
                $parameters['altType'.$key]  = $type;
            }
            $parameters['altType'] = 'County';
            $qb->andWhere($orX)->setParameters($parameters);
        }

        $qb->setMaxResults(200)->orderBy('g.rand', 'ASC');

        return $qb->getQuery()->getArrayResult();
    }
}
