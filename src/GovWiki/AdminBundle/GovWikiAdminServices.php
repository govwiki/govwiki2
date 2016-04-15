<?php

namespace GovWiki\AdminBundle;

/**
 * Class GovWikiAdminServices
 * @package GovWiki\AdminBundle
 */
abstract class GovWikiAdminServices
{
    const TXT_SITEMAP_GENERATOR = 'govwiki_admin.sitemap.generator.txt';

    const SHAPE_MANAGER = 'govwiki_admin.manager.shape';

    const TRANSFORMER_MANAGER = 'govwiki_admin.manager.transformer';
    const ADMIN_ENVIRONMENT_MANAGER = 'govwiki_admin.manager.environment';
    const ADMIN_STYLE_MANAGER = 'govwiki_admin.manager.style';
    const GOVERNMENT_TABLE_MANAGER = 'govwiki_admin.manager.government_table';

    /*
     * Entity namangers.
     */
    const GOVERNMENT_MANAGER = 'govwiki_admin.entity_manager.government';
    const ELECTED_OFFICIAL_MANAGER =
        'govwiki_admin.entity_manager.elected_official';
    const LEGISLATION_MANAGER = 'govwiki_admin.entity_manager.legislation';
    const CREATE_REQUEST_MANAGER = 'govwiki_admin.entity_manager.create_request';
    const EDIT_REQUEST_MANAGER = 'govwiki_admin.entity_manager.edit_request';
    const FORMAT_MANAGER = 'govwiki_admin.entity_manager.format';
    const TAB_MANAGER = 'govwiki_admin.entity_manager.tab';
    const CATEGORY_MANAGER = 'govwiki_admin.entity_manager.category';
    const FIN_DATA_MANAGER = 'govwiki_admin.entity_manager.fin_data';
    const LOCALE_MANAGER = 'govwiki_admin.entity_manager.locale';
    const TRANSLATION_MANAGER = 'govwiki_admin.entity_manager.translation';
    const COMMENT_MANAGER = 'govwiki_admin.entity_manager.vote_comment';
}
