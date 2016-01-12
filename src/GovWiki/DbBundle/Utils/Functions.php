<?php
namespace GovWiki\DbBundle\Utils;

/**
 * Class Functions
 * @package GovWiki\DbBundle\Utils
 */
final class Functions
{
    /**
     * Recursively group array by given fields name.
     *
     * @param array $array  Grouped array.
     * @param array $fields Array of fields name.
     *
     * @return array
     */
    public static function groupBy(array $array, array $fields)
    {
        $fieldName = array_shift($fields);

        $count = count($array);
        /*
         * Group up until there is a field to group.
         */
        if (($count > 0) && (null !== $fieldName)) {
            /*
             * Move first element to new group.
             */
            $current = self::getGroupValue($array, $fieldName);

            unset($array[0][$fieldName]);
            $tmp[$current][] = $array[0];

            for ($i = 1; $i < $count; ++$i) {
                if ($array[$i][$fieldName] !== $current) {
                    $tmp[$current] = self::groupBy($tmp[$current], $fields);
                    $current = self::getGroupValue($array, $fieldName, $i);
                }

                /*
                 * Move element to current group.
                 */
                unset($array[$i][$fieldName]);
                $tmp[$current][] = $array[$i];
            }
            $tmp[$current] = self::groupBy($tmp[$current], $fields);
            $array = $tmp;
        } elseif (count($array) === 1) {
            return $array[0];
        }

        return $array;
    }

    /**
     * Get value of element and prepare to use it as key.
     *
     * @param array   $array Grouped array.
     * @param string  $field Field name.
     * @param integer $index Element index.
     *
     * @return string
     */
    private static function getGroupValue(array $array, $field, $index = 0)
    {
        $current = $array[$index][$field];
        if ($current instanceof \DateTime) {
            $current = $current->format('Y-m-d');
        }

        return $current;
    }
}
