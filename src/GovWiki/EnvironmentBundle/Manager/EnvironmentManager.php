<?php

namespace GovWiki\EnvironmentBundle\Manager;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query\QueryException;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use GovWiki\EnvironmentBundle\Strategy\DefaultNamingStrategy;
use GovWiki\EnvironmentBundle\Strategy\NamingStrategyInterface;

/**
 * Interface EnvironmentManager
 * @package GovWiki\EnvironmentBundle\Manager
 */
class EnvironmentManager implements EnvironmentManagerInterface
{

    /**
     * @var EnvironmentStorageInterface
     */
    private $storage;

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var NamingStrategyInterface
     */
    private $namingStrategy;

    public function __construct(
        EntityManagerInterface $em,
        EnvironmentStorageInterface $storage
    ) {
        $this->em = $em;
        $this->storage = $storage;
    }

    /**
     * {@inheritdoc}
     */
    public function getEnvironment()
    {
        return $this->storage->get();
    }

    /**
     * {@inheritdoc}
     */
    public function getFieldFormat($fieldName)
    {
        return $this->em->getRepository('GovWikiDbBundle:Format')
            ->getOne($this->getEnvironment()->getId(), $fieldName);
    }

    /**
     * {@inheritdoc}
     */
    public function getAvailableYears()
    {
        $con = $this->em->getConnection();
        $tableName = $this->getNamingStrategy()
            ->getEnvironmentRelatedTableName($this->getEnvironment());

        $years = $con->fetchAll("
            SELECT year
            FROM {$tableName}
            GROUP BY year
            ORDER BY year DESC
        ");

        return array_map(
            function (array $result) {
                return $result['year'];
            },
            $years
        );
    }

    /**
     * {@inheritdoc}
     */
    public function computeElectedOfficialsCount()
    {
        $expr = $this->em->getExpressionBuilder();
        try {
            return $this->em->createQueryBuilder()
                ->from('GovWikiDbBundle:ElectedOfficial', 'eo')
                ->select($expr->count('eo.id'))
                ->join('eo.government', 'Government')
                ->where($expr->eq('Government.environment', ':environment'))
                ->setParameter('environment', $this->getEnvironment()->getId())
                ->getQuery()
                ->getSingleScalarResult();
        } catch (QueryException $e) {
            return 0;
        }
    }

    /**
     * {@inheritdoc}
     */
    public function getNamingStrategy()
    {
        if ($this->namingStrategy === null) {
            $this->namingStrategy = new DefaultNamingStrategy();
        }
        return $this->namingStrategy;
    }
}
