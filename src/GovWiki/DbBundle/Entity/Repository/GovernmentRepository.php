<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;
use Doctrine\ORM\Query;
use Doctrine\ORM\Query\Expr\Join;
use GovWiki\DbBundle\Entity\Document;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\Government;

/**
 * GovernmentRepository
 */
class GovernmentRepository extends EntityRepository
{

    /**
     * @param string $environment Environment entity slug.
     * @param string $altTypeSlug Slugged government alt type.
     * @param string $slug        Slugged government name.
     *
     * @return Government
     */
    public function getOne(
        $environment,
        $altTypeSlug,
        $slug
    ) {
        $expr = $this->_em->getExpressionBuilder();
        return $this->createQueryBuilder('Government')
            ->leftJoin('Government.environment', 'Environment')
            ->where(
                $expr->andX(
                    $expr->eq(
                        'Government.altTypeSlug',
                        $expr->literal($altTypeSlug)
                    ),
                    $expr->eq(
                        'Government.slug',
                        $expr->literal($slug)
                    ),
                    $expr->eq('Environment.slug', $expr->literal($environment))
                )
            )
            ->getQuery()
            ->getSingleResult();
    }

    /**
     * @param integer $government Government id.
     * @param integer $year       That year's of data to show. If null -
     *                            show for latest.
     *
     * @return Government
     *
     * @throws NonUniqueResultException If the query result is not unique.
     * @throws NoResultException If the query returned no result.
     */
    public function getGovernmentWithFinData($government, $year = null)
    {
        $qb = $this->createQueryBuilder('Government');
        $expr = $qb->expr();

        $qb
            ->addSelect('FinData, CaptionCategory, Fund')
            ->leftJoin('Government.finData', 'FinData')
            ->leftJoin('FinData.fund', 'Fund')
            ->leftJoin('FinData.captionCategory', 'CaptionCategory')
            ->where($expr->eq('Government.id', $government));

        if (null === $year) {
            /*
             * Query for fetching latest year.
             */
            $latestYear = $this->_em->createQuery('
                SELECT FinData2.year
                FROM GovWikiDbBundle:FinData FinData2
                WHERE FinData2.government = '. $government .'
                GROUP BY FinData2.year
                ORDER BY FinData2.year DESC
            ')
                ->setMaxResults(1)
                ->getDQL();

            $qb->andWhere($expr->eq('FinData.year', "({$latestYear})"));
        } else {
            $qb->andWhere($expr->eq('FinData.year', $year));
        }

        return $qb->getQuery()->getSingleResult();
    }

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

    /**
     * @param string $environment    Environment name.
     * @param string $altTypeSlug    Slugged alt type.
     * @param string $governmentSlug Slugged government name.
     * @param array  $parameters     Array of parameters:
     *                               <ul>
     *                                  <li>field_name (required)</li>
     *                                  <li>limit (required)</li>
     *                                  <li>page</li>
     *                                  <li>order</li>
     *                                  <li>name_order</li>
     *                                  <li>year</li>
     *                               </ul>.
     *
     * @return array
     */
    public function getGovernmentRank(
        $environment,
        $altTypeSlug,
        $governmentSlug,
        array $parameters
    ) {
        $rankFieldName = $parameters['field_name'];
        $limit = $parameters['limit'];
        $page = $parameters['page'];
        $order = $parameters['order'];
        $nameOrder = $parameters['name_order'];
        $year = $parameters['year'];

        $fieldName = preg_replace('|_rank$|', '', $rankFieldName);

        $con = $this->_em->getConnection();

        $mainSql = "
            SELECT
                government.slug AS name,
                extra.{$fieldName} AS amount,
                extra.{$rankFieldName} AS value
            FROM {$environment} extra
            INNER JOIN governments government ON extra.government_id = government.id
            INNER JOIN environments environment ON environment.id = government.environment_id
        ";

        $wheres = [
            "government.alt_type_slug = '{$altTypeSlug}'",
            "year = {$year}",
        ];
        $orderBys = [];

        /*
         * Get list of rank started from given government.
         */
        if ((null === $order) || ('' === $order)) {
            /*
             * Get rank for given government.
             */

            $sql = "
                SELECT extra.{$rankFieldName}
                FROM {$environment} extra
                INNER JOIN governments government ON extra.government_id = government.id
                WHERE
                    government.alt_type_slug = '{$altTypeSlug}' AND
                    government.slug = '{$governmentSlug}'
                ORDER BY extra.{$rankFieldName}
                LIMIT 1
            ";

            $wheres[] = "extra.{$rankFieldName} >= (". $sql .')';
            if (('desc' !== $nameOrder) && ('asc' !== $nameOrder)) {
                $orderBys[] = "extra.{$rankFieldName} ASC";
            }
        /*
         * Get sorted information from offset computed on given page and limit.
         */
        } elseif ('desc' === $order) {
            $orderBys[] = "extra.{$rankFieldName} DESC";
        } elseif ('asc' === $order) {
            $orderBys[] = "extra.{$rankFieldName} ASC";
        }

        if ('desc' === $nameOrder) {
            $orderBys[] = 'government.slug DESC';
        } elseif ('asc' === $nameOrder) {
            $orderBys[] = 'government.slug ASC';
        }

        if (count($wheres) > 0) {
            $mainSql .= ' WHERE ' . implode(' AND ', $wheres);
        }

        if (count($orderBys) > 0) {
            $mainSql .= ' ORDER BY ' .implode(' , ', $orderBys);
        }

        $mainSql .= ' LIMIT '. ($page * $limit) .', '. $limit;

        return $con->fetchAll($mainSql);
    }

    /**
     * Find government by slug and altTypeSlug.
     * Append maxRanks and financialStatements.
     *
     * @param string  $environment Environment name.
     * @param string  $altTypeSlug Slugged government alt type.
     * @param string  $slug        Slugged government name.
     * @param integer $year        For fetching fin data.
     *
     * @return array|null
     */
    public function findGovernment($environment, $altTypeSlug, $slug, $year)
    {
        $qb = $this->createQueryBuilder('Government');
        $expr = $qb->expr();

        /*
         * Get government.
         */
        $data = $qb
            ->select(
                'Government',
                'partial ElectedOfficial.{id, fullName, slug, displayOrder, title, emailAddress, telephoneNumber, photoUrl, bioUrl, termExpires}',
                'partial Document.{id, description, link, type}'
            )
            ->leftJoin('Government.electedOfficials', 'ElectedOfficial')
            ->leftJoin('Government.environment', 'Environment')
            ->leftJoin(
                'Government.documents',
                'Document',
                JOIN::WITH,
                $expr->andX(
                    $expr->eq('Document.government', 'Government.id'),
                    $expr->eq('YEAR(Document.date)', $year),
                    $expr->eq('Document.type', $expr->literal(Document::LAST_AUDIT))
                )
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

        if (count($data) <= 0) {
            return null;
        }

        $government = $data[0];

        /*
         * Get financial statements.
         */
        $finStmtYears = $this->_em->getRepository('GovWikiDbBundle:FinData')
            ->getAvailableYears($government['id']);

        $government['finData'] = [];
        if ((count($finStmtYears) > 0)) {
            $finData = $this
                ->_em->getRepository('GovWikiDbBundle:FinData')
                ->createQueryBuilder('FinData')
                ->select(
                    'partial FinData.{id, caption, dollarAmount, displayOrder}',
                    'CaptionCategory, Fund'
                )
                ->leftJoin('FinData.captionCategory', 'CaptionCategory')
                ->leftJoin('FinData.fund', 'Fund')
                ->where(
                    $expr->andX(
                        $expr->eq('FinData.government', $government['id']),
                        $expr->eq('FinData.year', $year)
                    )
                )
                ->orderBy($expr->asc('CaptionCategory.id'))
                ->addOrderBy($expr->asc('FinData.caption'))
                ->getQuery()
                ->getArrayResult();

            $financialStatementsGroups = [];
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

            $government['finData'] = $financialStatements;

            // Find latest audit url.
            $government['latestAuditUrl'] = null;
            if (count($government['documents'])) {
                $government['latestAuditUrl'] = $government['documents'][0];
            }
        }

        return $government;
    }

    /**
     * Search government with name like given in partOfName parameter.
     *
     * @param integer $environment Environment entity id.
     * @param string  $partOfName  Part of government name.
     *
     * @return array
     */
    public function search($environment, $partOfName)
    {
        $qb = $this->createQueryBuilder('Government');
        $expr = $qb->expr();

        return $qb
            ->select(
                'partial Government.{id, name, type, state, slug, altTypeSlug}'
            )
            ->where($expr->andX(
                $expr->eq('Government.environment', ':environment'),
                $expr->like('Government.name', ':partOfName')
            ))
            ->setParameters([
                'environment' => $environment,
                'partOfName' => '%'. $partOfName .'%',
            ])
            ->getQuery()
            ->getArrayResult();
    }
    /**
     * Search government with name like given in partOfName parameter and
     * return object with id, name and available governments years.
     *
     * @param string $environment Environment name.
     * @param string $partOfName  Part of government name.
     *
     * @return array
     */
    public function searchForComparison($environment, $partOfName)
    {
        $qb = $this->createQueryBuilder('Government');
        $expr = $qb->expr();

        $result = $qb
            ->select(
                'Government.id, Government.name, Government.altType',
                'FinData.year'
            )
            ->leftJoin('Government.environment', 'Environment')
            ->innerJoin('Government.finData', 'FinData')
            ->where(
                $expr->andX(
                    $expr->eq('Environment.slug', $expr->literal($environment)),
                    $expr->like(
                        'Government.name',
                        $expr->literal('%'.$partOfName.'%')
                    )
                )
            )
            ->groupBy('FinData.year, Government.id')
            ->orderBy($expr->asc('Government.id'))
            ->addOrderBy($expr->desc('FinData.year'))
            ->getQuery()
            ->getArrayResult();

        /*
         * Collect all government years;
         */
        $governmentList = [];
        $governmentListLength = 0;
        foreach ($result as $current) {
            if (0 === $governmentListLength) {
                /*
                 * Get first government.
                 */

                $governmentList[] = [
                    'id' => $current['id'],
                    'name' => $current['name'],
                    'altType' => $current['altType'],
                    'years' => [ $current['year'] ],
                ];
                $governmentListLength = 1;
            } elseif ($governmentList[$governmentListLength - 1]['id']
                === $current['id']) {
                /*
                 * Add new government comparison year.
                 */
                $governmentList[$governmentListLength - 1]['years'][] =
                    $current['year'];
            } else {
                /*
                 * Create new government row in list.
                 */
                $governmentList[] = [
                    'id' => $current['id'],
                    'name' => $current['name'],
                    'altType' => $current['altType'],
                    'years' => [ $current['year'] ],
                ];
                ++$governmentListLength;
            }
        }

        return $governmentList;
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
     * @param integer $id A Government entity id.
     *
     * @return Government
     *
     * @throws NoResultException
     * @throws NonUniqueResultException
     */
    public function getWithSubscribers($id)
    {
        $expr = $this->_em->getExpressionBuilder();

        return $this->createQueryBuilder('Government')
            ->addSelect('User')
            ->leftJoin('Government.subscribers', 'User')
            ->where($expr->eq('Government.id', ':id'))
            ->setParameter('id', $id)
            ->getQuery()
            ->getSingleResult();
    }

    /**
     * @param integer $government A Government entity id.
     * @param integer $user       A User entity id.
     *
     * @return boolean
     *
     * @throws NonUniqueResultException
     */
    public function isSubscriber($government, $user)
    {
        $expr = $this->_em->getExpressionBuilder();

        try {
            return $this->createQueryBuilder('Government')
                ->addSelect('User')
                ->leftJoin('Government.subscribers', 'User')
                ->where($expr->andX(
                    $expr->eq('Government.id', ':government'),
                    $expr->eq('User.id', ':user')
                ))
                ->setParameters([
                    'government' => $government,
                    'user'       => $user,
                ])
                ->getQuery()
                ->getSingleResult() !== null;
        } catch (NoResultException $e) {
            return false;
        }
    }

    /**
     * @param integer $subscriber User entity id.
     *
     * @return Government
     */
    public function getWithChatBySubscriber($subscriber)
    {
        $expr = $this->_em->getExpressionBuilder();

        return $this->createQueryBuilder('Government')
            ->addSelect('Chat')
            ->leftJoin('Government.chat', 'Chat')
            ->leftJoin('Government.subscribers', 'Subscriber')
            ->where($expr->in('Subscriber.id', ':subscriber'))
            ->setParameter('subscriber', [ $subscriber ])
            ->getQuery()
            ->getOneOrNullResult();
    }
}
