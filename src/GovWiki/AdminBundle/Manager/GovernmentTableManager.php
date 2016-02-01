<?php

namespace GovWiki\AdminBundle\Manager;

use Doctrine\ORM\EntityManagerInterface;

/**
 * Class GovernmentTableManager
 * @package GovWiki\AdminBundle\Manager
 */
class GovernmentTableManager
{

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @param EntityManagerInterface $em A EntityManagerInterface instance.
     */
    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    /**
     * @param string $name Government table name.
     *
     * @return GovernmentTableManager
     *
     * @throws \Doctrine\DBAL\DBALException Can't execute query.
     */
    public function createGovernmentTable($name)
    {
        $con = $this->em->getConnection();

        $con->exec("DROP TABLE IF EXISTS {$name}");
        $con->exec("
            CREATE TABLE `{$name}` (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `government_id` int(11) DEFAULT NULL,
                CONSTRAINT `fk_{$name}_government` FOREIGN KEY (`government_id`) REFERENCES `governments` (`id`),
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
        ");

        return $this;
    }

    /**
     * @param string $name Government table name.
     *
     * @return GovernmentTableManager
     *
     * @throws \Doctrine\DBAL\DBALException Can't execute query.
     */
    public function deleteGovernmentTable($name)
    {
        $name = strtolower($name);
        $this->em->getConnection()->exec("
            DROP TABLE IF EXISTS `{$name}`
        ");

        return $this;
    }

    /**
     * @param string $environment Environment name.
     * @param string $name        Column name.
     * @param string $type        Column type.
     *
     * @return GovernmentTableManager
     *
     * @throws \InvalidArgumentException Invalid column type.
     * @throws \Doctrine\DBAL\DBALException Can't execute query.
     */
    public function addColumnToGovernment($environment, $name, $type)
    {
        $type = self::resolveType($type);

        $this->em->getConnection()->exec("
            ALTER TABLE `{$environment}` ADD {$name} {$type} DEFAULT NULL
        ");

        return $this;
    }

    /**
     * @param string $environment Environment name.
     * @param string $oldName     Old column name.
     * @param string $newName     New column name.
     * @param string $newType     New column type.
     *
     * @return GovernmentTableManager
     *
     * @throws \InvalidArgumentException Invalid column type.
     * @throws \Doctrine\DBAL\DBALException Can't execute query.
     */
    public function changeColumnInGovernment(
        $environment,
        $oldName,
        $newName,
        $newType
    ) {
        $newType = self::resolveType($newType);

        $this->em->getConnection()->exec("
            ALTER TABLE `{$environment}`
            CHANGE {$oldName} {$newName} {$newType} DEFAULT NULL
        ");

        return $this;
    }

    /**
     * @param string $environment Environment name.
     * @param string $name        Column name.
     *
     * @return GovernmentTableManager
     *
     * @throws \Doctrine\DBAL\DBALException Can't execute query.
     */
    public function deleteColumnFromGovernment($environment, $name)
    {
        $this->em->getConnection()->exec("
            ALTER TABLE `{$environment}` DROP {$name}
        ");

        return $this;
    }

    /**
     * @param string $type One of 'string', 'integer' or 'float'.
     *
     * @return string
     *
     * @throws \InvalidArgumentException Invalid column type.
     */
    public static function resolveType($type)
    {
        switch ($type) {
            case 'string':
                $type = 'varchar(255)';
                break;

            case 'integer':
                $type = 'int';
                break;


            case 'float':
                $type = 'float';
                break;

            default:
                throw new \InvalidArgumentException('Invalid column type');
        }

        return $type;
    }
}
