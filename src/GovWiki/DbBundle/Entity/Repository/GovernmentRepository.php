<?php

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;
use Doctrine\ORM\Query;
use Doctrine\ORM\Query\Expr\Join;
use Doctrine\ORM\QueryBuilder;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Entity\Issue;

/**
 * GovernmentRepository
 */
class GovernmentRepository extends EntityRepository
{

    /**
     * @param integer $environment A Environment entity id.
     * @param string  $altTypeSlug Slugged government alt type.
     * @param string  $slug        Slugged government name.
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
            ->where($expr->andX(
                $expr->eq('Government.altTypeSlug', ':altTypeSlug'),
                $expr->eq('Government.slug', ':slug'),
                $expr->eq('Government.environment', ':environment')
            ))
            ->setParameters([
                'altTypeSlug' => $altTypeSlug,
                'slug' => $slug,
                'environment' => $environment,
            ])
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
     * @param integer $environment A Environment entity id.
     * @param integer $id          Government id.
     * @param string  $name        Government name.
     *
     * @return QueryBuilder
     */
    public function getListQuery($environment, $id = null, $name = null)
    {
        $expr = $this->_em->getExpressionBuilder();

        $qb = $this->createQueryBuilder('Government')
            ->where($expr->eq('Government.environment', ':environment'))
            ->setParameter('environment', $environment);

        if (null !== $id) {
            $qb
                ->andWhere($expr->eq('Government.id', ':id'))
                ->setParameter('id', $id);
        }
        if (null !== $name) {
            $qb
                ->andWhere($expr->like('Government.name', ':name'))
                ->setParameter('name', '%'. $name .'%');
        }

        return $qb;
    }

    /**
     * Find government by slug and altTypeSlug.
     * Append maxRanks and financialStatements.
     *
     * @param integer $environment Environment entity id.
     * @param string  $altTypeSlug Slugged government alt type.
     * @param string  $slug        Slugged government name.
     * @param integer $year        For fetching data.
     *
     * @return array
     */
    public function findGovernment($environment, $altTypeSlug, $slug, $year)
    {
        $expr = $this->_em->getExpressionBuilder();

        // Get government.
        $data = $this->createQueryBuilder('Government')
            ->select(
                'Government',
                'partial ElectedOfficial.{id, fullName, slug, displayOrder, title, emailAddress, telephoneNumber, photoUrl, bioUrl, termExpires}',
                'partial Issue.{id, name, description, link, type}',
                'partial EditRequest.{id, changes}',
                'partial User.{id}'
            )
            ->leftJoin('Government.electedOfficials', 'ElectedOfficial')
            ->leftJoin(
                'Government.issues',
                'Issue',
                JOIN::WITH,
                $expr->andX(
                    $expr->eq('Issue.government', 'Government.id'),
                    $expr->eq('YEAR(Issue.date)', $year),
                    $expr->eq('Issue.type', $expr->literal(Issue::LAST_AUDIT))
                )
            )
            ->leftJoin(
                'GovWikiDbBundle:EditRequest',
                'EditRequest',
                Join::WITH,
                $expr->andX(
                    $expr->eq('EditRequest.entityName', ':entity'),
                    $expr->eq('EditRequest.entityId', 'Government.id'),
                    $expr->eq('EditRequest.status', ':status')
                )
            )
            ->leftJoin('EditRequest.user', 'User')
            ->where($expr->andX(
                $expr->eq('Government.altTypeSlug', ':altTypeSlug'),
                $expr->eq('Government.slug', ':slug'),
                $expr->eq('Government.environment', ':environment')
            ))
            ->setParameters([
                'altTypeSlug' => $altTypeSlug,
                'slug' => $slug,
                'environment' => $environment,
                'entity' => 'Government',
                'status' => 'pending',
            ])
            ->orderBy($expr->desc('EditRequest.created'))
            ->getQuery()
            ->useQueryCache(true)
            ->useResultCache(true)
            ->getArrayResult();

        if ($data === null) {
            return [];
        }

        $government = $data[0];
        unset($data[0]);
        $lastEditRequest = $data[1];

        // Get government financial statements data.
        $finData = $this->_em->getRepository('GovWikiDbBundle:FinData')
            ->createQueryBuilder('FinData')
            ->select(
                'partial FinData.{id, caption, dollarAmount, displayOrder}',
                'CaptionCategory, Fund'
            )
            ->leftJoin('FinData.captionCategory', 'CaptionCategory')
            ->leftJoin('FinData.fund', 'Fund')
            ->where($expr->andX(
                $expr->eq('FinData.government', ':government'),
                $expr->eq('FinData.year', ':year')
            ))
            ->setParameters([
                'government' => $government['id'],
                'year' => $year,
            ])
            ->orderBy($expr->asc('CaptionCategory.id'))
            ->addOrderBy($expr->asc('FinData.caption'))
            ->getQuery()
            ->getArrayResult();

        $government['finData'] = $this->processFinData($finData);

        // Find latest audit url.
        $government['latestAuditUrl'] = null;
        foreach ($government['issues'] as $issue) {
            if ($issue['type'] === Issue::LAST_AUDIT) {
                $government['latestAuditUrl'] = $issue;
                break;
            }
        }

        return [
            'government' => $government,
            'lastEdit' => $lastEditRequest,
        ];
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
     * @param integer $environment A Environment entity id.
     * @param string  $partOfName  Part of government name.
     *
     * @return array
     */
    public function searchForComparison($environment, $partOfName)
    {
        $expr = $this->_em->getExpressionBuilder();

        $result = $this->createQueryBuilder('Government')
            ->select(
                'Government.id, Government.name, Government.altType',
                'FinData.year'
            )
            ->innerJoin('Government.finData', 'FinData')
            ->where($expr->andX(
                $expr->eq('Government.environment', ':environment'),
                $expr->like('Government.name', ':partOfName')
            ))
            ->setParameters([
                'environment' => $environment,
                'partOfName' => '%'. $partOfName .'%',
            ])
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

    /**
     * @param integer $environment A Environment entity id.
     * @param integer $page        Start page.
     * @param integer $limit       Max Government per page.
     *
     * @return array
     */
    public function getForExport($environment, $page, $limit = 1000)
    {
        $expr = $this->_em->getExpressionBuilder();

        return $this->createQueryBuilder('Government')
            ->select('Government.slug, Government.altTypeSlug, Government.name')
            ->where($expr->eq('Government.environment', ':environment'))
            ->setParameter('environment', $environment)
            ->setFirstResult($page * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getArrayResult();
    }

    /**
     * @param array $finData Government financial statements.
     *
     * @return array
     */
    private function processFinData(array $finData)
    {
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

        // Sort.
        usort($financialStatements, function (array $first, array $second) {
            $categoryA = $first['category_name'];
            $categoryB = $second['category_name'];

            if ($categoryA === $categoryB) {
                return 0;
            }

            return ($categoryA < $categoryB) ? 1 : -1;
        });

        return $financialStatements;
    }
}
