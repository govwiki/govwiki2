<?php

namespace GovWiki\AdminBundle;

/**
 * Class GovWikiAdminServices
 * @package GovWiki\AdminBundle
 */
abstract class GovWikiAdminServices
{
    const TRANSFORMER_MANAGER = 'govwiki_admin.manager.transformer';
    const ADMIN_ENVIRONMENT_MANAGER = 'govwiki_admin.manager.environment';

    const GOVERNMENT_MANAGER = 'govwiki_admin.entity_manager.government';
    const ELECTED_OFFICIAL_MANAGER =
        'govwiki_admin.entity_manager.elected_official';
    const LEGISLATION_MANAGER = 'govwiki_admin.entity_manager.legislation';
    const CREATE_REQUEST_MANAGER = 'govwiki_admin.entity_manager.create_request';
    const EDIT_REQUEST_MANAGER = 'govwiki_admin.entity_manager.edit_request';
}
