<?php

namespace GovWiki\AdminBundle\Manager;

use CartoDbBundle\Service\CartoDbApi;
use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Format;
use GovWiki\DbBundle\Utils\Functions;
use \Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

/**
 * Act same as {@see EnvironmentManager} but use only in admin part of
 * application.
 *
 * @package GovWiki\AdminBundle\Manager
 */
class AdminEnvironmentManager
{

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var string
     */
    private $environment;

    /**
     * @var array
     */
    private $format;

    /**
     * @var GovernmentTableManager
     */
    private $tableManager;

    /**
     * @var CartoDbApi
     */
    private $api;

    /**
     * @var Environment
     */
    private $entity;

    /**
     * @param EntityManagerInterface $em           A EntityManagerInterface
     *                                             instance.
     * @param TokenStorageInterface  $storage      A TokenStorageInterface
     *                                             instance.
     * @param GovernmentTableManager $tableManager A GovernmentTableManager
     *                                             instance.
     *
     * @throws AccessDeniedException Try to use AdminEnvironmentManager as
     * anonymous user.
     */
    public function __construct(
        EntityManagerInterface $em,
        GovernmentTableManager $tableManager,
        CartoDbApi $api
    ) {
        $this->em = $em;
        $this->tableManager = $tableManager;
        $this->api = $api;
    }

    /**
     * @return array
     */
    public function getGovernmentFields()
    {
        $qb = $this->em->getRepository('GovWikiDbBundle:Format')
            ->createQueryBuilder('Format');
        $expr = $qb->expr();

        $tmp = $qb
            ->select('Format.name, Format.field')
            ->join('Format.environment', 'Environment')
            ->where($expr->eq(
                'Environment.slug',
                $expr->literal($this->environment)
            ))
            ->getQuery()
            ->getArrayResult();

        $result = [];
        foreach ($tmp as $row) {
            $result[$row['field']] = $row['name'];
        }

        return $result;
    }

    /**
     * Get used alt types by government in current environment.
     *
     * @return array|null
     */
    public function getUsedAltTypes()
    {
        $qb =  $this->em->createQueryBuilder()
            ->select('Government.altType')
            ->from('GovWikiDbBundle:Government', 'Government');
        $expr = $qb->expr();

        $tmp = $qb
            ->leftJoin('Government.environment', 'Environment')
            ->where($expr->eq(
                'Environment.slug',
                $expr->literal($this->environment)
            ))
            ->groupBy('Government.altType')
            ->orderBy('Government.altType')
            ->getQuery()
            ->getArrayResult();

        if (count($tmp) > 0) {
            $result = [];
            foreach ($tmp as $row) {
                if (null !== $row['altType']) {
                    $result[$row['altType']] = $row['altType'];
                }
            }

            return $result;
        }
        return [];
    }

    /**
     * @param boolean $plain   Flag, if set return plain array without grouping
     *                         by tab names and fields.
     * @param string  $altType Government alt type, if set return format only
     *                         for given alt type.
     *
     * @return array
     */
    public function getFormats($plain = false, $altType = null)
    {
        if (null === $this->format) {
            $this->format = $this->em->getRepository('GovWikiDbBundle:Format')
                ->get($this->entity->getId(), true);
        }

        $result = $this->format;
        if (null !== $altType) {
            $result = [];
            foreach ($this->format as $row) {
                if (in_array($altType, $row['showIn'], true)) {
                    $result[] = $row;
                }
            }
        }

        if ($plain) {
            return $result;
        }
        return Functions::groupBy($result, [ 'tab_name', 'field' ]);
    }

    /**
     * @param string $name Column name.
     * @param string $type Column type.
     *
     * @return AdminEnvironmentManager
     *
     * @throws \InvalidArgumentException Invalid column type.
     * @throws \Doctrine\DBAL\DBALException Can't execute query.
     */
    public function addColumnToGovernment($name, $type)
    {
        $this->tableManager
            ->addColumnToGovernment($this->environment, $name, $type);

        return $this;
    }

    /**
     * @param string $oldName Old column name.
     * @param string $newName New column name.
     * @param string $newType New column type.
     *
     * @return AdminEnvironmentManager
     *
     * @throws \InvalidArgumentException Invalid column type.
     * @throws \Doctrine\DBAL\DBALException Can't execute query.
     */
    public function changeColumnInGovernment($oldName, $newName, $newType)
    {
        $this->tableManager
            ->changeColumnInGovernment(
                $this->environment,
                $oldName,
                $newName,
                $newType
            );

        return $this;
    }

    /**
     * @param string $name Column name.
     *
     * @return AdminEnvironmentManager
     *
     * @throws \Doctrine\DBAL\DBALException Can't execute query.
     */
    public function deleteColumnFromGovernment($name)
    {
        $this->tableManager
            ->deleteColumnFromGovernment($this->environment, $name);

        return $this;
    }

    /**
     * @param array $data Added data.
     *
     * @return AdminEnvironmentManager
     *
     * @throws \Doctrine\DBAL\DBALException Can't execute query.
     */
    public function addToGovernment(array $data)
    {
        $fields = array_keys($data);
        $values = array_values($data);
        /*
         * Add single quota around all string values.
         */
        foreach ($values as &$value) {
            if (null === $value) {
                $value = 'NULL';
            } if (is_string($value)) {
                $value = "'{$value}'";
            }
        }

        $this->em->getConnection()->exec("
            INSERT INTO `{$this->environment}` (". implode(',', $fields) .')
            VALUES ('. implode(',', $values) .')
        ');

        return $this;
    }

    /**
     * @param integer $governmentId Government entity id.
     *
     * @return AdminEnvironmentManager
     *
     * @throws \Doctrine\DBAL\DBALException Can't execute query.
     */
    public function deleteFromGovernment($governmentId)
    {
        $this->em->getConnection()->exec("
            DELETE FROM `{$this->environment}`
            WHERE government_id = {$governmentId}
        ");

        return $this;
    }


    /**
     * @param string $field Data field name.
     *
     * @return array
     *
     * @throws \RuntimeException Error while updating.
     */
    public function updateCartoDB($field = null)
    {
        /*
        * All needed columns for current environment table.
        */
        $columns = [
            'slug' => 'VARCHAR(255)',
            'alt_type_slug' => 'VARCHAR(255)',
            'data' => 'double precision',
            'name' => 'VARCHAR(255)',
        ];

        /*
         * Get all needed data such as governments slug, alt type slug, name and
         * data for colorizing (if field is set).
         */
        $fieldSql = "eg.${field}";
        if (null === $field) {
            $fieldSql = 'NULL';
        }
        $values = $this->em->getConnection()->fetchAll("
            SELECT g.slug, g.alt_type_slug, g.name, {$fieldSql} AS data
            FROM {$this->environment} eg
            JOIN governments g ON g.id = eg.government_id
        ");

        /*
         * Generate sql query to CartoDB.
         */
        $sqlParts = [];
        foreach ($values as $row) {
            if (null === $row['data']) {
                $row['data'] = 'null';
            }

            $slug = CartoDbApi::escapeString($row['slug']);
            $altTypeSlug = CartoDbApi::escapeString($row['alt_type_slug']);
            $data = $row['data'];
            $name = CartoDbApi::escapeString($row['name']);

            $sqlParts[] = "('{$slug}', '{$altTypeSlug}', {$data}, '{$name}')";
        }

        $response = $this->api
            ->createDataset($this->environment.'_temporary', $columns, true)
            ->sqlRequest("
                INSERT INTO {$this->environment}_temporary
                (slug, alt_type_slug, data, name)
                VALUES ". implode(',', $sqlParts));
        if (count($response) === 1) {
            throw new \RuntimeException($response['error']);
        }

        $response = $this->api->sqlRequest("UPDATE {$this->environment} e
            SET data = t.data, name = t.name
            FROM {$this->environment}_temporary t
            WHERE e.slug = t.slug AND
                e.alt_type_slug = t.alt_type_slug");

        if (count($response) === 1) {
            throw new \RuntimeException($response['error'][0]);
        }
    }

    /**
     * @param string $field Field name.
     *
     * @return array
     */
    public function getGovernmentsFiledValues($field)
    {
        return $this->em->getConnection()->fetchAll("
            SELECT
                g.slug, g.alt_type_slug, g.name, GROUP_CONCAT(eg.year) AS years,
                 GROUP_CONCAT(eg.{$field}) AS data
            FROM {$this->environment} eg
            JOIN governments g ON g.id = eg.government_id
            GROUP BY g.alt_type_slug, g.slug
            ORDER BY g.alt_type_slug, g.slug
        ");
    }
}
