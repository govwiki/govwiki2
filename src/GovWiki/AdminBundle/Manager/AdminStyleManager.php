<?php

namespace GovWiki\AdminBundle\Manager;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\EnvironmentStyles;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Mange styles of environments.
 *
 * @package GovWiki\AdminBundle\Utils
 */
class AdminStyleManager
{

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @param EntityManagerInterface $em A EntityManagerInterface instance.
     */
    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    /**
     * Add new style
     *
     * @param object $stylesObject
     * @return array
     */
    public function createStyles($stylesObject)
    {
        $styles = array_filter(explode(';', $stylesObject->getProperties(true)));
        $styleList = [];
        foreach ($styles as $style) {
            $param = explode(':', $style);
            $styleList[] = [trim($param[0]), trim($param[1])];
        }

        return json_encode($styleList);
    }

    /**
     * Generate css rules.
     *
     * @param array|EnvironmentStyles[] $styles List of styles.
     *
     * @return string
     */
    public function generate(array $styles)
    {
        $css = '';

        foreach ($styles as $style) {
            $css .= $style->getClassName() .'{';
            foreach ($style->getProperties() as $property) {
                $css .= $property[0] .':'. $property[1] .';';
            }
            $css .= '}';
        }

        return $css;
    }

    /**
     * Get current environment styles
     *
     * @param integer $environment Environment entity id.
     *
     * @return array
     */
    public function getStyles($environment)
    {
        return $this->em->getRepository('GovWikiDbBundle:EnvironmentStyles')->get($environment);
    }

    /**
     * Generate styles of Environment
     *
     * @param string $environment
     * @param object $styles
     */
    public function generateAndSaveStyles($environment, $styles)
    {
        $styleList = null;
        foreach ($styles as $style) {
            $styleList .= $style->getClassName().' { ';
            foreach ($style->getProperties() as $prop) {
                $styleList .= $prop[0].': '.$prop[1].'; ';
            }
            $styleList .= ' } ';
        }

        file_put_contents(__DIR__.'/../../../../web/css/'.$environment.'.css', $styleList);
    }
}
