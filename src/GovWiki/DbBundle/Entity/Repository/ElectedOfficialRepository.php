<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Expr\Join;

/**
 * ElectedOfficialRepository
 */
class ElectedOfficialRepository extends EntityRepository
{
    /**
     * @param integer $userId User id.
     *
     * @return array
     */
    public function getRouteParameters($userId)
    {
        $qb = $this->createQueryBuilder('ElectedOfficial');
        $expr = $qb->expr();

        return $qb
            ->select(
                'ElectedOfficial.slug AS eo_slug, Government.slug AS gov_slug',
                'Government.altTypeSlug AS gov_alt_type_slug',
                'Environment.slug AS env_slug'
            )
            ->join('ElectedOfficial.government', 'Government')
            ->join('Government.environment', 'Environment')
            ->where($expr->eq('ElectedOfficial.linkedUser', $userId))
            ->getQuery()
            ->getArrayResult()[0];
    }

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
     * @param string $environment Environment name.
     * @param string $altTypeSlug Slugged government alt type.
     * @param string $slug        Slugged government name.
     * @param string $eoSlug      Slugged elected official full name.
     *
     * @return array
     */
    public function findOne($environment, $altTypeSlug, $slug, $eoSlug)
    {
        $qb = $this->createQueryBuilder('ElectedOfficial');
        $expr = $qb->expr();
        return $qb
            ->addSelect(
                'Contribution, Endorsement, PublicStatement, Vote',
                'Legislation, CreateRequest, IssueCategory, LinkedUser',
                'partial Government.{id, altType, name}'
            )
            ->leftJoin('ElectedOfficial.contributions', 'Contribution')
            ->leftJoin('ElectedOfficial.endorsements', 'Endorsement')
            ->leftJoin('ElectedOfficial.publicStatements', 'PublicStatement')
            ->leftJoin('ElectedOfficial.votes', 'Vote')
            ->leftJoin('ElectedOfficial.government', 'Government')
            ->leftJoin('ElectedOfficial.linkedUser', 'LinkedUser')
            ->leftJoin('Vote.legislation', 'Legislation')
            ->leftJoin('Legislation.issueCategory', 'IssueCategory')
            /*
             * Join made but not applied create requests.
             */
            ->leftJoin(
                'GovWikiDbBundle:CreateRequest',
                'CreateRequest',
                Join::WITH,
                $expr->andX(
                    "regexp(CONCAT('electedOfficial\";s:[0-9]+:\"', ElectedOfficial.id), CreateRequest.fields) != false",
                    $expr->neq(
                        'CreateRequest.status',
                        $expr->literal('applied')
                    )
                )
            )

            ->leftJoin('Government.environment', 'Environment')
            ->where(
                $expr->andX(
                    $expr->eq('Environment.slug', $expr->literal($environment)),
                    $expr->eq('ElectedOfficial.slug', $expr->literal($eoSlug)),
                    $expr->eq('Government.slug', $expr->literal($slug)),
                    $expr->eq(
                        'Government.altTypeSlug',
                        $expr->literal($altTypeSlug)
                    )
                )
            )
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
                ElectedOfficial.fullName,
                ElectedOfficial.title,
                ElectedOfficial.emailAddress,
                Government.name,
                Government.slug
            ')
            ->join('ElectedOfficial.government', 'Government')
            ->where(
                $qb->expr()->in('ElectedOfficial.id', $ids)
            )
            ->getQuery()
            ->getArrayResult();
    }

    /**
     * Search elected official with name like given in partOfName parameter.
     *
     * @param string $environment Environment name.
     * @param string $partOfName  Part of elected official name.
     *
     * @return array
     */
    public function search($environment, $partOfName)
    {
        $qb = $this->createQueryBuilder('ElectedOfficial');
        $expr = $qb->expr();

        return $qb
            ->select(
                'partial ElectedOfficial.{id, fullName, slug},
                partial Government.{id, name, altTypeSlug, slug}'
            )
            ->leftJoin('ElectedOfficial.government', 'Government')
            ->leftJoin('Government.environment', 'Environment')
            ->where(
                $expr->andX(
                    $expr->eq('Environment.slug', $expr->literal($environment)),
                    $expr->like(
                        'ElectedOfficial.fullName',
                        $expr->literal('%'.$partOfName.'%')
                    )
                )
            )
            ->getQuery()
            ->getArrayResult();
    }
}
