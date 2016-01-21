<?php

namespace GovWiki\DbBundle\Reader;

/**
 * Interface ReaderInterface
 * @package GovWiki\DbBundle\Reader
 */
interface ReaderInterface
{
    /**
     * @return array
     */
    public function read();
}
