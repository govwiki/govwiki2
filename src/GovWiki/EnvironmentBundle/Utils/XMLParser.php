<?php

namespace GovWiki\EnvironmentBundle\Utils;

/**
 * Class XMLParser
 * @package GovWiki\EnvironmentBundle\Utils
 */
class XMLParser
{

    /**
     * @var resource
     */
    private $parser;

    /**
     * @var boolean
     */
    private $found = false;

    /**
     * @var string[]
     */
    private $data = [];

    /**
     * @var string[][]
     */
    private $rows = [];

    /**
     * @var string[]
     */
    private $row = [];

    /**
     * Path to current tag from document root.
     *
     * @var string
     */
    private $path;

    /**
     * @var string[]
     */
    private static $necessaryFields = [
        'title',
        'link',
        'pubdate',
        'description',
    ];

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->parser = xml_parser_create();
        xml_set_object($this->parser, $this);
        xml_set_character_data_handler($this->parser, 'readValue');
        xml_set_element_handler($this->parser, 'startTag', 'endTag');
    }

    /**
     * @param resource $parser Current parser.
     * @param string   $name   Tag name.
     *
     * @return void
     *
     * @SuppressWarnings(PHPMD.UnusedFormalParameter)
     */
    public function startTag($parser, $name)
    {
        $name = strtolower($name);

        $this->path[] = $name;

        if ($name === 'item') {
            $this->found = true;
        }
    }

    /**
     * @param resource $parser Current parser.
     * @param string   $data   Tag content.
     *
     * @return void
     *
     * @SuppressWarnings(PHPMD.UnusedFormalParameter)
     */
    public function readValue($parser, $data)
    {
        $data = trim($data);

        if ($this->found && (strlen($data) > 0)) {
            $this->data[] = $data;
        }
    }

    /**
     * @return void
     *
     * @SuppressWarnings(PHPMD.UnusedFormalParameter)
     */
    public function endTag()
    {
        $currentTag = array_pop($this->path);

        if ($this->found) {
            if (in_array($currentTag, self::$necessaryFields, true)) {
                $this->data = implode(' ', $this->data);
                $this->row[$currentTag] = $this->data;
            }

            $this->found =
                (count($this->row) <= count(self::$necessaryFields));

            $this->data = [];
        }

        if ($currentTag === 'item') {
            $this->rows[] = $this->row;
            $this->found = false;
            $this->data = [];
        }
    }

    /**
     * @param string $data XML data.
     *
     * @return array
     */
    public function parse($data)
    {
        xml_parse($this->parser, $data);

        return $this->rows;
    }
}
