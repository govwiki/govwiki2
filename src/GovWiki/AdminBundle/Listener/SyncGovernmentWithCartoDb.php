<?php

namespace GovWiki\AdminBundle\Listener;

use CartoDbBundle\Service\CartoDbApi;
use Doctrine\Common\EventSubscriber;
use Doctrine\Common\Persistence\Event\LifecycleEventArgs;
use Doctrine\ORM\Events;
use GovWiki\DbBundle\Entity\Government;

/**
 * Class SyncGovernmentWithCartoDb
 * @package GovWiki\AdminBundle\Listener
 */
class SyncGovernmentWithCartoDb implements EventSubscriber
{
    /**
     * @var CartoDbApi
     */
    private $api;

    /**
     * @param CartoDbApi $api A CartoDbApi instance.
     */
    public function __construct(CartoDbApi $api)
    {
        $this->api = $api;
    }

    /**
     * {@inheritdoc}
     */
    public function getSubscribedEvents()
    {
        return [
            Events::postUpdate,
            Events::postPersist,
            Events::preRemove,
        ];
    }

    /**
     * @param LifecycleEventArgs $event A LifecycleEventArgs instance.
     *
     * @return void
     */
    public function postUpdate(LifecycleEventArgs $event)
    {
        $entity = $event->getObject();

        if ($entity instanceof Government) {
            /*
             * Send update sql request to carto db api.
             */
            $environment = $entity->getEnvironment()->getSlug();
            $this->api->sqlRequest("
                UPDATE $environment
                SET
                    the_geom = ST_SetSRID(ST_MakePoint({$entity->getLongitude()}, {$entity->getLatitude()}), 4326),
                    alttypeslug = '{$entity->getAltTypeSlug()}',
                    slug = '{$entity->getSlug()}'
                WHERE
                    id = {$entity->getId()}
            ");
        }
    }

    /**
     * @param LifecycleEventArgs $event A LifecycleEventArgs instance.
     *
     * @return void
     */
    public function postPersist(LifecycleEventArgs $event)
    {
        $entity = $event->getObject();

        if ($entity instanceof Government) {
            $environment = $entity->getEnvironment()->getSlug();
            /*
             * Send insert sql request to carto db api.
             */
            $this->api->sqlRequest("
                INSERT INTO $environment (id, the_geom, alttypeslug, slug)
                VALUES
                    (
                        {$entity->getId()}, ST_SetSRID(ST_MakePoint({$entity->getLongitude()}, {$entity->getLatitude()}), 4326),
                        '{$entity->getAltTypeSlug()}',
                        '{$entity->getSlug()}'
                    )
            ");
        }
    }

    /**
     * @param LifecycleEventArgs $event A LifecycleEventArgs instance.
     *
     * @return void
     */
    public function preRemove(LifecycleEventArgs $event)
    {
        $entity = $event->getObject();

        if ($entity instanceof Government) {
            $environment = $entity->getEnvironment()->getSlug();
            /*
             * Send delete sql request to carto db api.
             */
            $this->api->sqlRequest("
                DELETE FROM $environment
                WHERE id = {$entity->getId()}
            ");
        }
    }
}
