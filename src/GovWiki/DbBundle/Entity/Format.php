<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Format
 *
 * @ORM\Table(name="formats")
 * @ORM\Entity
 */
class Format
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column()
     */
    private $category;

    /**
     * @var string
     *
     * @ORM\Column()
     */
    private $field;

    /**
     * @var string
     *
     * @ORM\Column()
     */
    private $description;

    /**
     * @var array
     *
     * @ORM\Column(type="array")
     */
    private $showIn;

    /**
     * Unknown field, maybe useless.
     *
     * @var string
     *
     * @ORM\Column()
     */
    private $dataOrFormula;

    /**
     * @var string
     *
     * @ORM\Column(type="boolean")
     */
    private $ranked;

    /**
     * @var string
     *
     * @ORM\Column()
     */
    private $mask;

    /**
     * @var string
     *
     * @ORM\Column(type="text")
     */
    private $helpText;

    /**
     * @var Map
     *
     * @ORM\ManyToOne(targetEntity="Map")
     * @ORM\JoinColumn(name="map_id")
     */
    private $map;

    /**
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getCategory()
    {
        return $this->category;
    }

    /**
     * @param string $category Category name.
     *
     * @return Format
     */
    public function setCategory($category)
    {
        $this->category = $category;

        return $this;
    }

    /**
     * @return string
     */
    public function getField()
    {
        return $this->field;
    }

    /**
     * @param string $field Entity field name.
     *
     * @return Format
     */
    public function setField($field)
    {
        $this->field = $field;

        return $this;
    }

    /**
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * @param string $description Field label.
     *
     * @return Format
     */
    public function setDescription($description)
    {
        $this->description = $description;

        return $this;
    }

    /**
     * @return array
     */
    public function getShowIn()
    {
        return $this->showIn;
    }

    /**
     * @param array $showIn Array of Government alt types, where we show this
     *                      field.
     *
     * @return Format
     */
    public function setShowIn(array $showIn)
    {
        $this->showIn = $showIn;

        return $this;
    }

    /**
     * @return string
     */
    public function getDataOrFormula()
    {
        return $this->dataOrFormula;
    }

    /**
     * @param string $dataOrFormula I don't known why we need this field.
     *
     * @return Format
     */
    public function setDataOrFormula($dataOrFormula)
    {
        $this->dataOrFormula = $dataOrFormula;

        return $this;
    }

    /**
     * @return string
     */
    public function isRanked()
    {
        return $this->ranked;
    }

    /**
     * @param string $ranked Ranking by this field.
     *
     * @return Format
     */
    public function setRanked($ranked)
    {
        $this->ranked = $ranked;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getMask()
    {
        return $this->mask;
    }

    /**
     * @param mixed $mask Mask to display field value.
     *
     * @return Format
     */
    public function setMask($mask)
    {
        $this->mask = $mask;

        return $this;
    }

    /**
     * @return string
     */
    public function getHelpText()
    {
        return $this->helpText;
    }

    /**
     * @param string $helpText Helper message.
     *
     * @return Format
     */
    public function setHelpText($helpText)
    {
        $this->helpText = $helpText;

        return $this;
    }

    /**
     * @return Map
     */
    public function getMap()
    {
        return $this->map;
    }

    /**
     * @param Map $map A Map instance.
     *
     * @return Format
     */
    public function setMap($map)
    {
        $this->map = $map;

        return $this;
    }
}
