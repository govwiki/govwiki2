<?php

namespace GovWiki\EnvironmentBundle\Manager\FinData;

use GovWiki\DbBundle\Utils\Functions;
use Symfony\Component\Translation\TranslatorInterface;

/**
 * Class FinDataProcessor
 * @package GovWiki\EnvironmentBundle\FinData
 */
class FinDataProcessor implements FinDataProcessorInterface
{

    /**
     * @var TranslatorInterface
     */
    private $translator;

    /**
     * @param TranslatorInterface $translator A TranslatorInterface instance.
     */
    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    /**
     * @param array $finData Fin data rows fetched by government manager.
     *
     * @return array
     */
    public function process(array $finData)
    {
        $transliterator = function (array $row) {
            $captionKey = 'findata.captions.'
                . $this->getTransKey($row['caption']);
            $categoryKey = 'general.findata.main.'.
                $this->getTransKey($row['category_name']);

            $row['translatedCaption'] = $this->translator->trans($captionKey);
            $row['translatedCategory'] = $this->translator->trans($categoryKey);

            return $row;
        };

        $result = array_map($transliterator, $finData);


        $result = Functions::groupBy($result, [ 'category_name', 'caption' ]);

        // Sort fin data by display order.

        $comparator = function ($a, $b) {
            if (isset($a['totalfunds'], $b['totalfunds'])) {
                $a = $a['totalfunds'];
                $b = $b['totalfunds'];

                if ($a === $b) {
                    return 0;
                }

                return ($a < $b) ? 1: -1;
            }

            return 0;
        };

        foreach ($result as &$statement) {
            uasort($statement, $comparator);
        }

        return $result;
    }

    /**
     * @param string $caption Fin data row caption.
     *
     * @return string
     */
    private function getTransKey($caption)
    {
        return strtr(strtolower(trim($caption)), [
            ' ' => '_',
            '-' => '_d_',
            '&' => 'amp',
            ',' => '_c_',
            '(' => 'lb',
            ')' => 'rb',
            '/' => 'sl',
            '%' => 'proc',
            "'" => '_apos_',
        ]);
    }
}
