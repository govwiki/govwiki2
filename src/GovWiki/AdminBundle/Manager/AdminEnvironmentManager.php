<?php

namespace GovWiki\AdminBundle\Manager;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\ApiBundle\Manager\EnvironmentManagerAwareInterface;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Format;
use GovWiki\DbBundle\Utils\Functions;
use GovWiki\UserBundle\Entity\User;
use \Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

/**
 * Act same as {@see EnvironmentManager} but use only in admin part of
 * application.
 *
 * @package GovWiki\AdminBundle\Manager
 */
class AdminEnvironmentManager
{
    const ENVIRONMENT_PARAMETER = 'environment';

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var string
     */
    private $environment;

    /**
     * @var TokenStorageInterface
     */
    private $storage;

    /**
     * @var Session
     */
    private $session;

    /**
     * @var array
     */
    private $format;

    /**
     * @param EntityManagerInterface $em      A EntityManagerInterface instance.
     * @param TokenStorageInterface  $storage A TokenStorageInterface instance.
     * @param Session                $session A Session instance.
     *
     * @throws AccessDeniedException Try to use AdminEnvironmentManager as
     * anonymous user.
     */
    public function __construct(
        EntityManagerInterface $em,
        TokenStorageInterface $storage,
        Session $session
    ) {
        /*
         * Get environment name from session. If session not contain environment
         * use configurator to set environment name.
         */
        $this->environment = $session->get(self::ENVIRONMENT_PARAMETER, null);

        $this->session = $session;
        $this->em = $em;
        $this->storage = $storage;
    }

    /**
     * @param string|Environment $environment A Environment instance or slug.
     *
     * @return AdminEnvironmentManager
     */
    public function changeEnvironment($environment)
    {
        if ($environment instanceof Environment) {
            $environment = $environment->getSlug();
        }

        $this->session->set(self::ENVIRONMENT_PARAMETER, $environment);
        $this->environment = $environment;
        $this->format = null;

        return $this;
    }

    /**
     * @return AdminEnvironmentManager
     */
    public function clearEnvironment()
    {
        $this->changeEnvironment(null);

        return $this;
    }

    /**
     * @return string
     */
    public function getEnvironment()
    {
        return $this->environment;
    }

    /**
     * @return string
     */
    public function getSlug()
    {
        return Environment::slugify($this->environment);
    }

    /**
    * Get map data for current environment.
    *
    * @return \GovWiki\DbBundle\Entity\Map|null
    */
    public function getMap()
    {
        return $this->em->getRepository('GovWikiDbBundle:Map')
            ->getByEnvironment($this->environment);
    }

    /**
     * @return array|null
     */
    public function getStyle()
    {
        return $this->em->getRepository('GovWikiDbBundle:Environment')
            ->getStyle($this->environment);
    }

    /**
     * @param array $style Styles.
     *
     * @return void
     */
    public function setStyle(array $style)
    {
        $environment = $this->getReference();
        $environment->setStyle($style);

        $this->em->persist($environment);
        $this->em->flush();
    }

    /**
     * Return environment entity.
     *
     * @return \GovWiki\DbBundle\Entity\Environment|null
     *
     * @throws AccessDeniedException User don't allow to manage current
     * environment.
     */
    public function getEntity()
    {
        $user = $this->getUser();

        if ($user->hasRole('ROLE_ADMIN')) {
            /*
             * Admin allow to manage all environment.
             */
            return $this->em->getRepository('GovWikiDbBundle:Environment')
                ->getByName($this->environment);
        } elseif ($user->hasRole('ROLE_MANAGER')) {
            /*
             * Manager allow manage only some part of environments.
             */
            return $this->em->getRepository('GovWikiDbBundle:Environment')
                ->getByName($this->environment, $user->getId());
        }

        throw new AccessDeniedException();
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
     * Get proxy environment entity.
     *
     * @return Environment
     *
     * @throws AccessDeniedException User don't allow to manage current
     * environment.
     */
    public function getReference()
    {
        $user = $this->getUser();

        if ($user->hasRole('ROLE_ADMIN')) {
            return $this->em
                ->getRepository('GovWikiDbBundle:Environment')
                ->getReferenceByName($this->environment);
        } elseif ($user->hasRole('ROLE_MANAGER')) {
            return $this->em
                ->getRepository('GovWikiDbBundle:Environment')
                ->getReferenceByName($this->environment, $user->getId());
        }

        throw new AccessDeniedException();
    }

    /**
     * @param string $environment Environment name.
     *
     * @return AdminEnvironmentManager
     *
     * @throws AccessDeniedException User don't allow to manage current
     * environment.
     * @throws \Doctrine\DBAL\DBALException Can't delete government related
     *                                      table.
     */
    public function removeEnvironment($environment)
    {
        $this->environment = $environment;
        $entity = $this->getReference();

        $this->em->getConnection()->exec("DROP TABLE {$environment}");

        $qb = $this->em->createQueryBuilder();
        $expr = $qb->expr();

        $qb
            ->delete()
            ->from('GovWikiDbBundle:Government', 'Government')
            ->where($expr->eq('Government.environment', $entity->getId()))
            ->getQuery()
            ->execute();

        $this->em->remove($entity);
        $this->em->flush();

        $this->deleteGovernmentTable($environment);

        return $this;
    }

    /**
     * @return AdminEnvironmentManager
     */
    public function disable()
    {
        $entity = $this->getEntity();
        $entity->setEnabled(false);

        $this->em->persist($entity);
        $this->em->flush();

        return $this;
    }

    /**
     * @return AdminEnvironmentManager
     */
    public function enable()
    {
        $entity = $this->getEntity();
        $entity->setEnabled(true);

        $this->em->persist($entity);
        $this->em->flush();

        return $this;
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
                ->get($this->environment, true);
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
     * @param AdminEntityManagerAwareInterface $entityManager A
     *                                                        AdminEntityManagerAwareInterface
     *                                                        instance.
     *
     * @return void
     */
    public function configure(AdminEntityManagerAwareInterface $entityManager)
    {
        $entityManager->setEnvironment($this->environment);
        $entityManager->setEnvironmentId($this->getReference()->getId());
    }

    /**
     * @param string $name Government table name.
     *
     * @return AdminEnvironmentManager
     */
    public function createGovernmentTable($name)
    {
        $this->em->getConnection()->exec("
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
     * @return AdminEnvironmentManager
     */
    public function deleteGovernmentTable($name)
    {
        $this->em->getConnection()->exec("
            DROP TABLE IF EXISTS `{$name}`
        ");

        return $this;
    }

    /**
     * @param string $name Column name.
     * @param string $type Column type.
     *
     * @return AdminEnvironmentManager
     *
     * @throws \InvalidArgumentException Invalid column type.
     */
    public function addColumnToGovernment($name, $type)
    {
        switch ($type) {
            case 'string':
                $type = 'varchar(255)';
                break;

            case 'integer':
                $type = 'int';
                break;

            default:
                throw new \InvalidArgumentException('Invalid column type');
        }

        $this->em->getConnection()->exec("
            ALTER TABLE `{$this->environment}` ADD {$name} {$type} DEFAULT NULL
        ");

        return $this;
    }

    /**
     * @param string $oldName Old column name.
     * @param string $newName New column name.
     * @param string $newType New column type.
     *
     * @return $this
     */
    public function changeColumnInGovernment($oldName, $newName, $newType)
    {
        switch ($newType) {
            case 'string':
                $newType = 'varchar(255)';
                break;

            case 'integer':
                $newType = 'int';
                break;

            default:
                throw new \InvalidArgumentException('Invalid column type');
        }

        $this->em->getConnection()->exec("
            ALTER TABLE `{$this->environment}` CHANGE {$oldName} {$newName} {$newType} DEFAULT NULL
        ");

        return $this;
    }

    /**
     * @param string $name Column name.
     *
     * @return AdminEnvironmentManager
     */
    public function deleteColumnFromGovernment($name)
    {
        $this->em->getConnection()->exec("
            ALTER TABLE `{$this->environment}` DROP {$name}
        ");

        return $this;
    }

    /**
     * @param array $data
     *
     * @return AdminEnvironmentManager
     */
    public function addToGovernment(array $data)
    {
        $fields = array_keys($data);
        $values = array_values($data);
        foreach ($values as &$value) {
            if (is_string($value)) {
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
     * @param array $data
     *
     * @return AdminEnvironmentManager
     */
    public function updateGovernment(array $data)
    {
        $stmt = '';
        foreach ($data as $field => $value) {
            if (is_string($value)) {
                $value = "'{$value}'";
            }

            $stmt .= "{$field} = {$value},";
        }
        $stmt = rtrim($stmt, ',');

        $this->em->getConnection()->exec("
            UPDATE `{$this->environment}` SET {$stmt}
        ");

        return $this;
    }

    /**
     * @param integer $government_id Government entity id.
     *
     * @return AdminEnvironmentManager
     */
    public function deleteFromGovernment($government_id)
    {
        $this->em->getConnection()->exec("
            DELETE FROM `{$this->environment}`
            WHERE government_id = {$government_id}
        ");

        return $this;
    }

    /**
     * @param integer $id Government id.
     *
     * @return array
     */
    public function getGovernment($id)
    {
        return $this->em->getConnection()->fetchAssoc("
            SELECT t.* FROM `{$this->environment}` t
            WHERE t.government_id = :id
        ", [ 'id' => $id ]);
    }

    /**
     * @param integer $limit  Max row count.
     * @param integer $offset Offset from table start.
     *
     * @return \Doctrine\DBAL\Driver\Statement
     *
     * @throws \Doctrine\DBAL\DBALException Query error.
     */
    public function getGovernments($limit = null, $offset = 0)
    {
        $sql = "
            SELECT g.*, e.* FROM `{$this->environment}` e
            INNER JOIN governments g ON e.government_id = g.id
        ";

        if (null !== $limit) {
            $sql .= " LIMIT {$limit} OFFSET {$offset}";
        }

        return $this->em->getConnection()->query($sql);
    }

    /**
     * @return User
     */
    private function getUser()
    {
        $token = $this->storage->getToken();

        if (null === $token) {
            throw new AccessDeniedException();
        }

        return $token->getUser();
    }
}
