<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
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
     */
    private $id;

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
     * @Asset\Url()
     */
    private $vizUrl;

    /**
     * @var float
     *
     * @ORM\Column(type="float")
     * @Asset\Type(type="float")
     */
    private $centerLatitude;

    /**
     * @var float
     *
     * @ORM\Column(type="float")
     * @Asset\Type(type="float")
     */
    private $centerLongitude;

    /**
     * @var integer
     *
     * @ORM\Column(type="integer")
     * @Asset\Type(type="integer")
     */
    private $zoom;

    /**
     * @var boolean
     *
     * @ORM\Column(type="boolean")
     */
    private $created = false;

    /**
     * @var Environment
     *
     * @ORM\OneToOne(targetEntity="Environment", mappedBy="map")
     */
    private $environment;

    /**
     * Need to create process.
     *
     * @var UploadedFile
     *
     * @Asset\File()
     */
    private $countyFile;

    /**
     * Need to create process.
     *
     * @var UploadedFile
     *
     * @Asset\File()
     */
    private $governmentsFile;

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
     * @return UploadedFile
     */
    public function getCountyFile()
    {
        return $this->countyFile;
    }

    /**
     * @param UploadedFile $countyFile A UploadedFile instance.
     *
     * @return Map
     */
    public function setCountyFile(UploadedFile $countyFile = null)
    {
        $this->countyFile = $countyFile;

        return $this;
    }

    /**
     * @return UploadedFile
     */
    public function getGovernmentsFile()
    {
        return $this->governmentsFile;
    }

    /**
     * @param UploadedFile $governmentsFile A UploadedFile instance.
     *
     * @return Map
     */
    public function setGovernmentsFile(UploadedFile $governmentsFile = null)
    {
        $this->governmentsFile = $governmentsFile;

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
}
