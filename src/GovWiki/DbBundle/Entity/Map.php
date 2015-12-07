<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use GovWiki\DbBundle\Utils\LatLng;
use JMS\Serializer\Annotation\Groups;

/**
 * Map
 *
 * @ORM\Table(name="maps")
 * @ORM\Entity
 */
class Map
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
     * @var LatLng
     *
     * @ORM\Column(type="lat_lng")
     * @Groups({"map"})
     */
    private $center;

    /**
     * @var integer
     *
     * @ORM\Column(type="integer")
     * @Groups({"map"})
     */
    private $zoom;

    /**
     * @var integer
     *
     * @ORM\Column(type="integer")
     * @Groups({"map"})
     */
    private $width;

    /**
     * @var integer
     *
     * @ORM\Column(type="integer")
     * @Groups({"map"})
     */
    private $height;

    /**
     * @var array
     *
     * @ORM\Column(type="array", nullable=true)
     * @Groups({"map"})
     */
    private $style;

    /**
     * @var Collection
     *
     * @ORM\OneToMany(targetEntity="Government", mappedBy="map")
     * @Groups({"map"})
     */
    private $governments;

    /**
     *
     */
    public function __construct()
    {
        $this->governments = new ArrayCollection();
    }

    /**
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return LatLng
     */
    public function getCenter()
    {
        return $this->center;
    }

    /**
     * @param LatLng $center Coordinates of the center of the map.
     *
     * @return Map
     */
    public function setMapCenter(LatLng $center)
    {
        $this->center = $center;

        return $this;
    }

    /**
     * @return integer
     */
    public function getZoom()
    {
        return $this->zoom;
    }

    /**
     * @param integer $zoom Zoom level.
     *
     * @return Map
     */
    public function setZoom($zoom)
    {
        $this->zoom = $zoom;

        return $this;
    }

    /**
     * @return integer
     */
    public function getWidth()
    {
        return $this->width;
    }

    /**
     * @param integer $width Map width.
     *
     * @return Map
     */
    public function setWidth($width)
    {
        $this->width = $width;

        return $this;
    }

    /**
     * @return integer
     */
    public function getHeight()
    {
        return $this->height;
    }

    /**
     * @param integer $height Map height.
     *
     * @return Map
     */
    public function setHeight($height)
    {
        $this->height = $height;

        return $this;
    }

    /**
     * @return array
     */
    public function getStyle()
    {
        return $this->style;
    }

    /**
     * @param array $style Map style, see google map api document.
     *
     * @return Map
     */
    public function setStyle(array $style)
    {
        $this->style = $style;

        return $this;
    }

    /**
     * @param Government $government A Government instance.
     *
     * @return Map
     */
    public function addGovernment(Government $government)
    {
        $this->governments[] = $government;

        return $this;
    }

    /**
     * @param Government $government A Government instance.
     *
     * @return Map
     */
    public function removeGovernment(Government $government)
    {
        $this->governments->remove($government);

        return $this;
    }

    /**
     * @return ArrayCollection|Collection
     */
    public function getGovernments()
    {
        return $this->governments;
    }
}
