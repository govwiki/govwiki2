<?php

namespace GovWiki\AdminBundle\Transformer;

/**
 * Convert CSV file to plain array of data.
 * {@link https://www.ietf.org/rfc/rfc4180.txt}
 *
 * @package GovWiki\AdminBundle\Transformer
 */
class CsvTransformer implements FileTransformerInterface
{
    /**
     * {@inheritdoc}
     */
    public static function supportedExtensions()
    {
        return [ 'csv' ];
    }

    /**
     * {@inheritdoc}
     */
    public static function getFormatName()
    {
        return 'CSV';
    }


    /**
     * {@inheritdoc}
     */
    public function transform($filePath)
    {
        /*
         * Assume that first row contain column names according to rfc4180.2.3
         */
        $line = $this->lineFromFileGenerator($filePath);
        $header = explode(';', $line->current());
        $line->next();

        /*
         * Get all file lines, combine with header and put into result.
         */
        $result = [];
        for ($current = $line->current(); $current !== null;
             $current = $line->current()
        ) {
            $result[] = array_combine($header, explode(';', $current));
            $line->next();
        }

        return $result;
    }

    /**
     * {@inheritdoc}
     */
    public function reverseTransform($filePath, array $data)
    {
        if (count($data) <= 0) {
            return;
        }

        /*
         * From header line and put into result.
         */
        $lines = [ implode(';', array_keys($data[0])) . "\n" ];

        foreach ($data as $row) {
            $lines[] = implode(';', array_values($row)) . "\n";
        }

        file_put_contents($filePath, $lines);
    }

    /**
     * @param string $filePath Path to file.
     *
     * @return \Generator
     */
    private function lineFromFileGenerator($filePath)
    {
        $fp = fopen($filePath, 'r');
        while (($line = fgets($fp)) !== false) {
            yield str_replace(["\n", "\r"], '', $line);
        }
        fclose($fp);
        yield null;
    }
}
