<?php

namespace GovWiki\EnvironmentBundle\Manager\Data\Format;

use GovWiki\EnvironmentBundle\Manager\Data\AbstractDataManager;

/**
 * Class FormatManager
 * @package GovWiki\EnvironmentBundle\Data\Manager\Data\Government
 */
class FormatManager extends AbstractDataManager implements
    FormatManagerInterface
{

    /**
     * {@inheritdoc}
     */
    public function getFieldFormat($environment, $fieldName)
    {
        $this->em->getRepository('GovWikiDbBundle:Format')
            ->getOne($environment, $fieldName);
    }

    /**
     * {@inheritdoc}
     */
    public function getList($environment, $altType = null)
    {
        $result = $this->em->getRepository('GovWikiDbBundle:Format')
            ->get($environment, true);

        if (null !== $altType) {
            /*
             * Remove formats not show in specified alt type.
             */
            $filteredResult = [];
            foreach ($result as $format) {
                if (in_array($altType, $format['showIn'], true)) {
                    $filteredResult[] = $format;
                }
            }
            $result = $filteredResult;
        }

        return $result;
    }
}
