<?php

namespace GovWiki\AdminBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;

/**
 * Class ScriptExecutionLogRepository
 *
 * @package GovWiki\AdminBundle\Entity\Repository
 */
class ScriptExecutionLogRepository extends EntityRepository
{

    /**
     * @param string $name Required script name.
     *
     * @return QueryBuilder
     */
    public function getBuilderForScript(string $name): QueryBuilder
    {
        return $this->createQueryBuilder('ScriptExecutionLog')
            ->where('ScriptExecutionLog.name = :name')
            ->setParameter('name', $name)
            ->orderBy('ScriptExecutionLog.startTime', 'desc');
    }
}
