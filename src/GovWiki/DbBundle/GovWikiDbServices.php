<?php

namespace GovWiki\DbBundle;

/**
 * Class GovWikiDbServices
 * @package GovWiki\DbBundle
 */
abstract class GovWikiDbServices
{
    const MAX_RANKS_COMPUTER = 'govwiki_db.service.max_ranks_computer';

    const CREATE_REQUEST_MANAGER = 'govwiki_db.manager.create_request';

    const GOVERNMENT_IMPORTER = 'govwiki_db.importer.government';
    const FIN_DATA_IMPORTER = 'govwiki_db.importer.fin_data';
}
