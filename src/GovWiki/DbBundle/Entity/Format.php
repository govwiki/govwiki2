<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation\Groups;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Validator\Constraints as Asset;

/**
 * Format
 *
 * @ORM\Table(name="formats")
 * @ORM\Entity(
 *  repositoryClass="GovWiki\DbBundle\Entity\Repository\FormatRepository"
 * )
 *
 * @UniqueEntity(
 *  fields={ "field" },
 *  message="Column with current field name already exists."
 * )
 */
class Format
{

    /**
     * Show rank in range format like (45 of 250).
     */
    const RANK_RANGE = 'range';

    /**
     * Show rank in latter grade like A.
     */
    const RANK_LETTER = 'letter';

    const SOURCE_USER_DEFINED = 'user_defined';
    const SOURCE_GOVERNMENT = 'government';

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
     * @Asset\NotBlank(message="Name should not be blank.")
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column()
     * @Asset\NotBlank(message="Field name should not be blank.")
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
     * @var Category
     *
     * @ORM\ManyToOne(targetEntity="Category", inversedBy="formats")
     * @ORM\JoinColumn(name="category_id")
     */
    private $category;

    /**
     * @var string
     *
     * @ORM\Column()
     */
    private $rankType = self::RANK_RANGE;

    /**
     * First key is alt type, second key is grade ('a', 'b', ... etc).
     *
     * [
     *  'City' => [
     *      'a' => [
     *          'start' => 20,
     *          'end' => 40,
     *      ],
     *      ...
     *  ],
     *  ...
     * ]
     *
     * @var array
     *
     * @ORM\Column(type="array")
     */
    private $rankLetterRanges = [];

    /**
     * @var string
     *
     * @ORM\Column
     */
    private $source = self::SOURCE_USER_DEFINED;

    /**
     * @return array
     */
    public static function availableTypes()
    {
        return ['string', 'integer', 'float'];
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
        if ($this->helpText === null) {
            return '';
        }

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

    /**
     * Set rankType
     *
     * @param string $rankType Rank type one of
     *                         {@see Format::RANK_RANGE} or
     *                         {@see Format::RANK_LETTER}.
     *
     * @return Format
     */
    public function setRankType($rankType)
    {
        $this->rankType = $rankType;

        return $this;
    }

    /**
     * Get rankType
     *
     * @return string
     */
    public function getRankType()
    {
        return $this->rankType;
    }

    /**
     * Set rankLetterRange
     *
     * @param array $rankLetterRanges Array of letter ranges.
     *
     * @return Format
     */
    public function setRankLetterRanges(array $rankLetterRanges = [])
    {
        $this->rankLetterRanges = $rankLetterRanges;

        return $this;
    }

    /**
     * Get rankLetterRange
     *
     * @return array
     */
    public function getRankLetterRanges()
    {
        return $this->rankLetterRanges;
    }

    /**
     * @param string $altType A Government entity altTypeSlug.
     * @param string $letter  Grade letter.
     *
     * @return array
     */
    public function getRankLetterRange($altType, $letter)
    {
        $letter = strtolower($letter);

        // Check given alt type slug.
        if (! in_array($altType, $this->rankLetterRanges, true)) {
            return [];
        }

        // Check given letter.
        if (! in_array($letter, $this->rankLetterRanges[$altType], true)) {
            return [];
        }

        return $this->rankLetterRanges[$letter];
    }

    /**
     * @param string $altType A Government entity altType.
     * @param string $percent Ratio between current rank and maximum.
     *
     * @return string
     */
    public function matchRankLetterRange($altType, $percent)
    {
        // Check given alt type slug.
        if (! in_array($altType, $this->rankLetterRanges, true)) {
            return 'f';
        }

        foreach ($this->rankLetterRanges[$altType] as $grade => $range) {
            if (($percent >= $range['start']) && ($percent <= $range['end'])) {
                return $grade;
            }
        }

        // Put bad grade if value don't found.
        return 'f';
    }

    /**
     * Set source
     *
     * @param string $source Field source.
     *
     * @return Format
     */
    public function setSource($source)
    {
        $this->source = $source;

        return $this;
    }

    /**
     * Get source
     *
     * @return string
     */
    public function getSource()
    {
        return $this->source;
    }
}
