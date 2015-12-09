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
     * @param string $name
     *
     * @return Map
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }
}
