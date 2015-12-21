<?php

namespace GovWiki\AdminBundle\Manager\Entity;

use CartoDbBundle\Service\CartoDbApi;
use Doctrine\ORM\EntityManagerInterface;
use GovWiki\AdminBundle\Manager\AbstractAdminEntityManager;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Entity\Repository\GovernmentRepository;

/**
 * Class AdminGovernmentManager
 * @package GovWiki\AdminBundle\Manager
 */
class AdminGovernmentManager extends AbstractAdminEntityManager
{
    /**
     * @var CartoDbApi
     */
    private $api;

    /**
     * @var boolean
     */
    private $insertIntoCartoDb;

    /**
     * @param EntityManagerInterface $em  A EntityManagerInterface instance.
     * @param CartoDbApi             $api A CartoDbApi instance.
     */
    public function __construct(EntityManagerInterface $em, CartoDbApi $api)
    {
        parent::__construct($em);
        $this->api = $api;
    }

    /**
     * {@inheritdoc}
     */
    protected function getEntityClassName()
    {
        return 'GovWiki\DbBundle\Entity\Government';
    }

    /**
     * @param integer $id   Government id.
     * @param string  $name Government name.
     *
     * @return \Doctrine\ORM\Query
     */
    public function getListQuery($id = null, $name = null)
    {
        /** @var GovernmentRepository $repository */
        $repository = $this->getRepository();
        return $repository->getListQuery($this->environment, $id, $name);
    }

    /**
     * @return \GovWiki\DbBundle\Entity\Government
     */
    public function create()
    {
        /** @var Government $government */
        $government = parent::create();
        return $government->setEnvironment($this->getEnvironmentReference());
    }

    /**
     * {@inheritdoc}
     */
    protected function beforeUpdate($entity)
    {
        $this->insertIntoCartoDb = false;
        if ($entity instanceof Government) {
            if (null === $entity->getId()) {
                /*
                 * Insert new entity into CartoDB dataset.
                 */
                $this->insertIntoCartoDb = true;
            } else {
                /*
                 * Update entity in CartoDB dataset.
                 */
                $this->api->sqlRequest("
                    UPDATE $this->environment
                    SET
                        the_geom = ST_SetSRID(ST_MakePoint({$entity->getLongitude()}, {$entity->getLatitude()}), 4326),
                        alttypeslug = '{$entity->getAltTypeSlug()}',
                        slug = '{$entity->getSlug()}'
                    WHERE
                        id = {$entity->getId()}
                ");
            }
        }

        return $entity;
    }

    /**
     * {@inheritdoc}
     */
    protected function afterUpdate($entity)
    {
        if ($this->insertIntoCartoDb) {
            $this->api->sqlRequest("
                    INSERT INTO $this->environment (id, the_geom, alttypeslug, slug)
                    VALUES
                        (
                            {$entity->getId()}, ST_SetSRID(ST_MakePoint({$entity->getLongitude()}, {$entity->getLatitude()}), 4326),
                            '{$entity->getAltTypeSlug()}',
                            '{$entity->getSlug()}'
                        )
                ");
        }
    }


}
