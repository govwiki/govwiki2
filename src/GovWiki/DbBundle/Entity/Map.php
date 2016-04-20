<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use GovWiki\DbBundle\Doctrine\Type\ColoringConditions\ColoringConditions;
use JMS\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Asset;

/**
 * Map
 *
 * @ORM\Table(name="maps")
 * @ORM\Entity(repositoryClass="GovWiki\DbBundle\Entity\Repository\MapRepository")
 */
class Map
{
    const LEGEND_ALT_TYPES = 'altTypes';
    const LEGEND_COLORS = 'range';

    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     *
     * @Groups({"map"})
     */
    private $id;

    /**
     * @var float
     *
     * @ORM\Column(type="float")
     * @Asset\Type(type="float")
     *
     * @Groups({"map"})
     */
    private $centerLatitude = 0.0;

    /**
     * @var float
     *
     * @ORM\Column(type="float")
     * @Asset\Type(type="float")
     *
     * @Groups({"map"})
     */
    private $centerLongitude = 0.0;

    /**
     * @var integer
     *
     * @ORM\Column(type="integer")
     * @Asset\Type(type="integer")
     *
     * @Groups({"map"})
     */
    private $zoom = 3;

    /**
     * @var string
     *
     * @ORM\Column()
     * @Asset\Choice(callback="availablePositions")
     *
     * @Groups({"map"})
     */
    private $position = 'left';

    /**
     * @var ColoringConditions
     *
     * @ORM\Column(type="coloring_conditions")
     *
     * @Groups({"map"})
     */
    private $coloringConditions;

    /**
     * @var boolean
     *
     * @ORM\Column(type="boolean")
     *
     * @Groups({"map"})
     */
    private $created = false;

    /**
     * @var Environment
     *
     * @ORM\OneToOne(targetEntity="Environment", mappedBy="map")
     *
     * @Groups({"map"})
     */
    private $environment;

    /**
     * @var boolean
     *
     * @ORM\Column(type="boolean")
     *
     * @Groups({"map"})
     */
    private $debug = false;

    /**
     * @var array
     *
     * @ORM\Column(type="array")
     *
     * @Groups({"map"})
     */
    private $legend = [];

    /**
     * @var array
     *
     * @ORM\Column(type="array")
     *
     * @Groups({"map"})
     */
    private $legendTypes = [ self::LEGEND_ALT_TYPES ];

    /**
     * @return array
     */
    public static function availablePositions()
    {
        return [ 'left', 'top' ];
    }

    /**
     *
     */
    public function __construct()
    {
        $this->governments = new ArrayCollection();
        $this->coloringConditions = new ColoringConditions();
    }

    /**
     * @return array
     */
    public function toArray()
    {
        return [
            'centerLatitude' => $this->getCenterLatitude(),
            'centerLongitude' => $this->getCenterLongitude(),
            'zoom' => $this->getZoom(),
            'position' => $this->getPosition(),
            'coloringConditions' => $this
                ->getColoringConditions()
                ->toArray(),
            'debug' => $this->isDebug(),
            'legendTypes' => $this->getLegendTypes(),
            'legend' => $this->getLegend(),
        ];
    }

    /**
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return integer
     */
    public function getZoom()
    {
        return $this->zoom;
    }

    /**
     * @param integer $zoom Map initial zoom level.
     *
     * @return Map
     */
    public function setZoom($zoom)
    {
        $this->zoom = $zoom;

        return $this;
    }

    /**
     * @return float
     */
    public function getCenterLongitude()
    {
        return $this->centerLongitude;
    }

    /**
     * @param float $centerLongitude Longitude of map center.
     *
     * @return Map
     */
    public function setCenterLongitude($centerLongitude)
    {
        $this->centerLongitude = $centerLongitude;

        return $this;
    }

    /**
     * @return float
     */
    public function getCenterLatitude()
    {
        return $this->centerLatitude;
    }

    /**
     * @param float $centerLatitude Latitude of map center.
     *
     * @return Map
     */
    public function setCenterLatitude($centerLatitude)
    {
        $this->centerLatitude = $centerLatitude;

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
     * @param Environment $environment Environment instance.
     *
     * @return Map
     */
    public function setEnvironment(Environment $environment)
    {
        $environment->setMap($this);
        $this->environment = $environment;

        return $this;
    }

    /**
     * @return boolean
     */
    public function isCreated()
    {
        return $this->created;
    }

    /**
     * @param boolean $created Flag, if true use update to manage map.
     *
     * @return Map
     */
    public function setCreated($created)
    {
        $this->created = $created;

        return $this;
    }

    /**
     * @return string
     */
    public function getPosition()
    {
        return $this->position;
    }

    /**
     * @param string $position Map position in page layout.
     *
     * @return Map
     */
    public function setPosition($position)
    {
        $this->position = $position;

        return $this;
    }

    /**
     * @return ColoringConditions
     */
    public function getColoringConditions()
    {
        return $this->coloringConditions;
    }

    /**
     * @param ColoringConditions $coloringConditions A ColoringConditions
     *                                               instance.
     *
     * @return Map
     */
    public function setColoringConditions(ColoringConditions $coloringConditions)
    {
        $this->coloringConditions = $coloringConditions;

        return $this;
    }

    /**
     * @return boolean
     */
    public function isDebug()
    {
        return $this->debug;
    }

    /**
     * @param boolean $debug Debug flag.
     *
     * @return Map
     */
    public function setDebug($debug)
    {
        $this->debug = $debug;

        return $this;
    }

    /**
     * @return array
     */
    public function getLegend()
    {
        return $this->legend;
    }

    /**
     * @param array $legend Legend array.
     *
     * @return Map
     */
    public function setLegend(array $legend)
    {
        $this->legend = $legend;

        return $this;
    }

    /**
     * @return array
     */
    public function getLegendTypes()
    {
        return $this->legendTypes;
    }

    /**
     * @param array $legendTypes Array of available alt types.
     *
     * @return Map
     */
    public function setLegendTypes(array $legendTypes)
    {
        $this->legendTypes = $legendTypes;

        return $this;
    }
}
