<?php

namespace GovWiki\AdminBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\QueryException;
use GovWiki\AdminBundle\Entity\Template;

/**
 * TemplateRepository
 */
class TemplateRepository extends EntityRepository
{

    /**
     * @param string $environment Environment slugged name.
     *
     * @return Template
     *
     * @throws QueryException Query result is not unique.
     */
    public function getVoteEmailTemplate($environment)
    {
        $expr = $this->_em->getExpressionBuilder();

        return $this->createQueryBuilder('Template')
            ->innerJoin('Template.environment', 'Environment')
            ->where($expr->andX(
                $expr->eq('Environment.slug', $expr->literal($environment)),
                $expr->eq('Template.name', $expr->literal('vote_email'))
            ))
            ->getQuery()
            ->getOneOrNullResult();
    }
}
