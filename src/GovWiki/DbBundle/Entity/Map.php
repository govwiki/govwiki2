<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation\Groups;

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
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column()
     */
    private $name;

    /**
     * @var Collection
     *
     * @ORM\OneToMany(targetEntity="Government", mappedBy="map")
     * @Groups({"map"})
     */
    private $governments;

    /**
     * Unique identifier of carto db process.
     *
     * @var string
     *
     * @ORM\Column(nullable=true)
     */
    private $itemQueueId;

    /**
     * @var string
     *
     * @ORM\Column(nullable=true)
     */
    private $vizUrl;

    /**
     * @var float
     *
     * @ORM\Column(type="float")
     */
    private $centerLatitude;

    /**
     * @var float
     *
     * @ORM\Column(type="float")
     */
    private $centerLongitude;

    /**
     * @var integer
     *
     * @ORM\Column(type="integer")
     */
    private $zoom;

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

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string $name Map name.
     *
     * @return Map
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * @return string
     */
    public function getItemQueueId()
    {
        return $this->itemQueueId;
    }

    /**
     * @param string $itemQueueId Unique identifier of carto db process.
     *
     * @return Map
     */
    public function setItemQueueId($itemQueueId)
    {
        $this->itemQueueId = $itemQueueId;

        return $this;
    }

    /**
     * @return string
     */
    public function getVizUrl()
    {
        return $this->vizUrl;
    }

    /**
     * @param string $vizUrl Carto db viz url.
     *
     * @return Map
     */
    public function setVizUrl($vizUrl)
    {
        $this->vizUrl = $vizUrl;

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
     * @param float $centerLongitude
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
     * @param float $centerLatitude
     *
     * @return Map
     */
    public function setCenterLatitude($centerLatitude)
    {
        $this->centerLatitude = $centerLatitude;

        return $this;
    }
}
