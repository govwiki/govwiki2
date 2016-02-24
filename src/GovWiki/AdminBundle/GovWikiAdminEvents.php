<?php

namespace GovWiki\AdminBundle;

/**
 * Class GovWikiAdminEvents
 * @package GovWiki\AdminBundle
 */
abstract class GovWikiAdminEvents
{
    /**
     * Rise then admin add new government entity.
     * Listener receives {@see GovernmentAddEvent}
     */
    const GOVERNMENT_ADD = 'gowviki.event.government.add';

    /**
     * Rise then admin change government information.
     * Listener receives {@see GovernmentUpdateEvent}
     */
    const GOVERNMENT_UPDATE = 'govwiki.event.government.update';
}
