<?php

namespace GovWiki\DbBundle\Entity;

use CartoDbBundle\Utils\NamedMap;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use GovWiki\DbBundle\Doctrine\Type\ColorizedCountyCondition\ColorizedCountyConditions;
use JMS\Serializer\Annotation\Groups;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Validator\Constraints as Asset;

/**
 * Map
 *
 * @ORM\Table(name="maps")
 * @ORM\Entity(repositoryClass="GovWiki\DbBundle\Entity\Repository\MapRepository")
 */
class Map
{
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
     * @var ColorizedCountyConditions
     *
     * @ORM\Column(type="colorized_county_condition")
     *
     * @Groups({"map"})
     */
    private $colorizedCountyConditions;

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
        $this->colorizedCountyConditions = new ColorizedCountyConditions();
    }

    /**
     * @param string $name Map name.
     *
     * @return NamedMap
     */
    public function toNamedMap($name)
    {
        $namedMap = new NamedMap($name);
        $namedMap
            ->setLatitude($this->centerLatitude)
            ->setLongitude($this->centerLongitude)
            ->setZoom($this->zoom);
        return $namedMap;
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
     * @return ColorizedCountyConditions
     */
    public function getColorizedCountyConditions()
    {
        return $this->colorizedCountyConditions;
    }

    /**
     * @param ColorizedCountyConditions $colorizedCountyConditions A ColorizedCountyConditions instance.
     *
     * @return Map
     */
    public function setColorizedCountyConditions(ColorizedCountyConditions $colorizedCountyConditions)
    {
        $this->colorizedCountyConditions = $colorizedCountyConditions;

        return $this;
    }
}
