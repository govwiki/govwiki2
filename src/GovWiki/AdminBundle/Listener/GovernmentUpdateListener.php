<?php

namespace GovWiki\AdminBundle\Listener;

use CartoDbBundle\Service\CartoDbApi;
use GovWiki\AdminBundle\Event\GovernmentAddEvent;
use GovWiki\AdminBundle\Event\GovernmentUpdateEvent;

/**
 * Class GovernmentUpdateListener
 * @package GovWiki\AdminBundle\Listener
 */
class GovernmentUpdateListener
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
     * @param GovernmentAddEvent $event A GovernmentAddEvent instance.
     *
     * @return void
     */
    public function onGovernmentAdd(GovernmentAddEvent $event)
    {
        $government = $event->getGovernment();

        $slug = CartoDbApi::escapeString($government->getSlug());
        $altTypeSlug = CartoDbApi::escapeString($government->getAltTypeSlug());
        $name = CartoDbApi::escapeString($government->getSlug());
        $data = $event->getColorizedData();
        if (null === $data) {
            $data = 'NULL';
        }

        $this->api
            ->sqlRequest("
                INSERT INTO {$government->getEnvironment()->getSlug()}
                    (slug, alt_type_slug, data, name)
                VALUES
                    (
                        '{$slug}',
                        '{$altTypeSlug}',
                        {$data},
                        '{$name}'
                    )
            ");
    }

    /**
     * @param GovernmentUpdateEvent $event A GovernmentUpdateEvent instance.
     *
     * @return void
     */
    public function onGovernmentUpdate(GovernmentUpdateEvent $event)
    {

    }
}
