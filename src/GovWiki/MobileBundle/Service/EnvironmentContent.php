<?php

namespace GovWiki\MobileBundle\Service;

/**
 * Class EnvironmentContent
 * @package GovWiki\MobileBundle\Service
 */
class EnvironmentContent
{
    /**
     * @var object
     */
    private $doctrine;

    /**
     * @var object
     */
    private $templating;

    /**
     * @var array
     */
    private $content = [];

    /**
     * @param object $doctrine
     * @param object $templating
     */
    public function __construct($doctrine, $templating)
    {
        $this->doctrine   = $doctrine;
        $this->templating = $templating;
    }

    /**
     * Init
     *
     * @param string $environment
     * @return null
     */
    public function init($environment = null)
    {
        if (empty($environment)) {
            return null;
        }

        $em = $this->doctrine->getManager();

        $result = $em->createQuery(
            'SELECT co FROM GovWikiDbBundle:EnvironmentContents co
             LEFT JOIN co.environment en
             WHERE en.slug = :environment'
        )->setParameters(
            [
                'environment' => $environment,
            ]
        )->getArrayResult();

        $values = [];
        foreach ($result as $val) {
            $values[$val['slug']] = $val['value'];
        }

        $this->content = $values;
    }

    /**
     * Get content by slug
     *
     * @param string $slug
     * @return null
     */
    public function get($slug)
    {
        if (array_key_exists($slug, $this->content)) {
            return $this->content[$slug];
        }

        return null;
    }
}
