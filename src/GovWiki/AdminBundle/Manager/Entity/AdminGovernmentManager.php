<?php

namespace GovWiki\AdminBundle\Manager\Entity;

use CartoDbBundle\Service\CartoDbApi;
use Doctrine\ORM\EntityManagerInterface;
use GovWiki\AdminBundle\Manager\AbstractAdminEntityManager;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Entity\Repository\FormatRepository;
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
    public function getAll(array $columns = null, $offset = 0, $limit = null)
    {
        if (null === $columns) {
            $columns = [
                'name',
                'type',
                'altType',
                'latitude',
                'longitude',
            ];

            /** @var FormatRepository $repository */
            $repository = $this->getRepository('GovWikiDbBundle:Format');
            $format = $repository->get($this->environment, true);

            foreach ($format as $row) {
                $columns[] = $row['field'];
            }
        }

        $columns = array_merge($columns, [
            'name',
            'slug',
            'type',
            'altType',
            'altTypeSlug',
            'latitude',
            'longitude'
        ]);

        return parent::getAll($columns, $offset, $limit);
    }
}
