<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Asset;

/**
 * Format
 *
 * @ORM\Table(name="formats")
 * @ORM\Entity(
 *  repositoryClass="GovWiki\DbBundle\Entity\Repository\FormatRepository"
 * )
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
     * @Groups({"government"})
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column()
     */
    private $field;

    /**
     * @var string
     */
    public $oldField = null;

    /**
     * @var array
     *
     * @ORM\Column(type="array")
     * @Groups({"government"})
     */
    private $showIn = [];

    /**
     * Unknown field, maybe useless.
     *
     * @var string
     *
     * @ORM\Column()
     * @Groups({"government"})
     */
    private $dataOrFormula = 'data';

    /**
     * @var string
     *
     * @ORM\Column(type="boolean")
     * @Groups({"government"})
     */
    private $ranked = false;

    /**
     * @var string
     *
     * @ORM\Column(nullable=true)
     * @Groups({"government"})
     */
    private $mask;

    /**
     * @var string
     *
     * @ORM\Column()
     * @Groups({"government"})
     * @Asset\Choice(
     *  callback="availableTypes",
     *  message="Type must be 'integer', 'string' or float"
     * )
     */
    private $type = 'integer';

    /**
     * @var string
     *
     * @ORM\Column(type="text", nullable=true)
     * @Groups({"government"})
     */
    private $helpText;

    /**
     * @var Environment
     *
     * @ORM\ManyToOne(targetEntity="Environment", inversedBy="formats")
     * @ORM\JoinColumn(name="environment_id")
     */
    private $environment;

    /**
     * @var Tab
     *
     * @ORM\ManyToOne(targetEntity="Tab")
     * @ORM\JoinColumn(name="tab_id")
     */
    private $tab;

    /**
     * @var Category
     *
     * @ORM\ManyToOne(targetEntity="Category")
     * @ORM\JoinColumn(name="category_id")
     */
    private $category;

    /**
     * @return array
     */
    public static function availableTypes()
    {
        return [ 'string', 'integer', 'float' ];
    }

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
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string $name Displayed field name.
     *
     * @return Format
     */
    public function setName($name)
    {
        $this->name = $name;
        $this->field = self::slugifyName($name);
        return $this;
    }

    /**
     * @param string $string Format name to slugify.
     *
     * @return string
     */
    public static function slugifyName($string)
    {
        $slug = preg_replace('/\W/', '_', $string);
        $slug = preg_replace('/_+/', '_', $slug);
        return trim(strtolower($slug), '_');
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
    public function getType()
    {
        return $this->type;
    }

    /**
     * @param string $type Must be 'string' or 'integer'.
     *
     * @return Format
     */
    public function setType($type)
    {
        $this->type = $type;

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
     * @return Environment
     */
    public function getEnvironment()
    {
        return $this->environment;
    }

    /**
     * @param Environment $environment A Environment instance.
     *
     * @return Format
     */
    public function setEnvironment(Environment $environment)
    {
        $this->environment = $environment;

        return $this;
    }

    /**
     * @return Tab
     */
    public function getTab()
    {
        return $this->tab;
    }

    /**
     * @param Tab $tab A Tab instance.
     *
     * @return Format
     */
    public function setTab(Tab $tab)
    {
        $this->tab = $tab;

        return $this;
    }

    /**
     * @return Category
     */
    public function getCategory()
    {
        return $this->category;
    }

    /**
     * @param Category $category A Category instance.
     *
     * @return Format
     */
    public function setCategory(Category $category = null)
    {
        $this->category = $category;

        return $this;
    }
}
