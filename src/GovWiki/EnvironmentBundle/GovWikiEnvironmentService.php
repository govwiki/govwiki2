<?php

namespace GovWiki\EnvironmentBundle;

/**
 * Class GovWikiEnvironmentService
 * @package GovWiki\EnvironmentBundle
 */
abstract class GovWikiEnvironmentService
{
    const MANAGER = 'govwiki_environment.manager';
    const STORAGE = 'govwiki_environment.storage';

    const MAX_RANK_DATA_MANAGER = 'govwiki_environment.data_manager.max_ranks';
    const GOVERNMENT_DATA_MANAGER = 'govwiki_environment.data_manager.government';
}
