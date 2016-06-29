<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\Query;

/**
 * ElectedOfficialRepository
 */
class ElectedOfficialRepository extends EntityRepository
{

    /**
     * @param string  $environment Environment name.
     * @param integer $id          Elected official id.
     * @param string  $fullName    Elected official full name.
     * @param string  $government  Government name.
     *
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery(
        $environment,
        $id = null,
        $fullName = null,
        $government = null
    ) {
        $qb = $this
            ->createQueryBuilder('eo')
            ->leftJoin('eo.government', 'Government')
            ->leftJoin('Government.environment', 'Environment');

        $expr = $qb->expr();

        $qb->where($expr->eq('Environment.slug', $expr->literal($environment)));

        if (null !== $id) {
            $qb->andWhere($expr->eq('eo.id', $id));
        }
        if (null !== $fullName) {
            $qb->andWhere(
                $expr->like('eo.fullName', $expr->literal('%'.$fullName.'%'))
            );
        }
        if (null !== $government) {
            $qb->andWhere($expr->like(
                'Government.name',
                $expr->literal('%'.$government.'%')
            ));
        }

        return $qb->getQuery();
    }

    /**
     * Get information about elected official specified by slugged full name in
     * government specified by slugged name and alt type for given environment.
     *
     * Return:
     * <ul>
     *  <li>ElectedOfficial entity with all related contributions, endorsements
     * and etc</li>
     *  <li>Array of made CreateRequest for current elected official</li>
     * </ul>
     *
     * @param integer $environment A Environment entity id.
     * @param string  $altTypeSlug Slugged government alt type.
     * @param string  $slug        Slugged government name.
     * @param string  $eoSlug      Slugged elected official full name.
     *
     * @return array
     */
    public function findOne($environment, $altTypeSlug, $slug, $eoSlug)
    {
        $expr = $this->_em->getExpressionBuilder();

        return $this->createQueryBuilder('ElectedOfficial')
            ->addSelect(
                'partial Government.{id, altType, name, secondaryLogoPath, secondaryLogoUrl}',
                'partial EditRequest.{id, changes}',
                'partial User.{id}'
            )
            ->join('ElectedOfficial.government', 'Government')
            ->leftJoin(
                'GovWikiDbBundle:EditRequest',
                'EditRequest',
                Query\Expr\Join::WITH,
                $expr->andX(
                    "(REGEXP('bio', EditRequest.changes)) = 1",
                    $expr->eq('EditRequest.entityId', 'ElectedOfficial.id'),
                    $expr->eq('EditRequest.status', $expr->literal('pending'))
                )
            )
            ->leftJoin('EditRequest.user', 'User')
            ->where($expr->andX(
                $expr->eq('Government.environment', ':environment'),
                $expr->eq('ElectedOfficial.slug', ':eoSlug'),
                $expr->eq('Government.slug', ':slug'),
                $expr->eq('Government.altTypeSlug', ':altTypeSlug')
            ))
            ->setParameters([
                'environment' => $environment,
                'eoSlug'      => $eoSlug,
                'slug'        => $slug,
                'altTypeSlug' => $altTypeSlug,
            ])
            ->orderBy($expr->desc('EditRequest.created'))
            ->getQuery()
            ->getArrayResult();
    }

    /**
     * Get elected officials by ids.
     *
     * @param array $ids Elected officials ids.
     *
     * @return array
     */
    public function getDataForEmailByIds(array $ids = [])
    {
        $qb = $this->createQueryBuilder('ElectedOfficial');
        return $qb
            ->select('
                ElectedOfficial.id,
                ElectedOfficial.fullName,
                ElectedOfficial.title,
                ElectedOfficial.emailAddress,
                ElectedOfficial.slug AS elected_slug,
                Government.name,
                Government.slug AS government_slug,
                Government.altTypeSlug
            ')
            ->join('ElectedOfficial.government', 'Government')
            ->where(
                $qb->expr()->in('ElectedOfficial.id', $ids)
            )
            ->getQuery()
            ->getArrayResult();
    }

    /**
     * Get elected officials by government alt_type.
     *
     * @param integer $environment A Environment entity id.
     * @param array  $alt_types Government alt_type.
     *
     * @return array
     */
    public function getEmailsByAltTypes($environment, $alt_types)
    {
        $qb = $this->createQueryBuilder('ElectedOfficial');
        $expr = $qb->expr();
        return $qb
            ->select(
                'ElectedOfficial.emailAddress as email',
                'ElectedOfficial.id as custom_id'
            )
            ->join('ElectedOfficial.government', 'Government')
            ->where(
                $qb->expr()->andX(
                    $expr->isNotNull('ElectedOfficial.emailAddress'),
                    $expr->in('Government.altType', $alt_types),
                    $expr->eq('Government.environment', ':environment')
                )
            )
            ->groupBy('ElectedOfficial.emailAddress')
            ->setParameter('environment', $environment)
            ->getQuery()
            ->getArrayResult();
    }

    /**
     * Search elected official with name like given in partOfName parameter.
     *
     * @param integer $environment A Environment entity id.
     * @param string  $partOfName  Part of elected official name.
     *
     * @return array
     */
    public function search($environment, $partOfName)
    {
        $expr = $this->_em->getExpressionBuilder();

        return $this->createQueryBuilder('ElectedOfficial')
            ->select(
                'partial ElectedOfficial.{id, fullName, slug}',
                'partial Government.{id, name, altTypeSlug, slug}'
            )
            ->leftJoin('ElectedOfficial.government', 'Government')
            ->where($expr->andX(
                $expr->eq('Government.environment', ':environment'),
                $expr->like('ElectedOfficial.fullName', ':partOfName')
            ))
            ->setParameters([
                'environment' => $environment,
                'partOfName' => '%'. $partOfName .'%',
            ])
            ->getQuery()
            ->getArrayResult();
    }
}
