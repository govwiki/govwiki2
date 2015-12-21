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
                'Legislation, CreateRequest, IssueCategory',
                'partial Government.{id}'
            )
            ->leftJoin('ElectedOfficial.contributions', 'Contribution')
            ->leftJoin('ElectedOfficial.endorsements', 'Endorsement')
            ->leftJoin('ElectedOfficial.publicStatements', 'PublicStatement')
            ->leftJoin('ElectedOfficial.votes', 'Vote')
            ->leftJoin('ElectedOfficial.government', 'Government')
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
}
