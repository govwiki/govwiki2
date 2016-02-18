<?php

namespace GovWiki\AdminBundle\Services;

/**
 * Interface SitemapGeneratorInterface
 * @package GovWiki\AdminBundle\Services
 */
interface SitemapGeneratorInterface
{
    /**
     * Generate new sitemap and robots.txt for given environment and place it
     * under web directory.
     *
     * @param string $environment Environment slug.
     *
     * @return void
     */
    public function generate($environment);

    /**
     * Return name of robots file for given environment.
     *
     * @param string $environment Environment slug.
     *
     * @return string
     */
    public static function getRobotsTxtName($environment);

    /**
     * Return name of sitemap file for given environment.
     *
     * @param string $environment Environment slug.
     *
     * @return string
     */
    public static function getSitemapName($environment);
}
