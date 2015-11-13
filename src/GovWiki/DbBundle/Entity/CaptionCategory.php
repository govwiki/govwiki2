<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation\ExclusionPolicy;
use JMS\Serializer\Annotation\Exclude;
use JMS\Serializer\Annotation\Groups;

/**
 * CaptionCategory
 *
 * @ORM\Table(name="caption_categories")
 * @ORM\Entity
 * @ExclusionPolicy("none")
 */
class CaptionCategory
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
     * @ORM\Column(name="name", type="string", length=255, nullable=true)
     * @Groups({"government"})
     */
    private $name;

    /**
     * @var boolean
     *
     * @ORM\Column(name="display", type="boolean", nullable=true)
     * @Groups({"government"})
     */
    private $display;

    /**
     * @ORM\OneToMany(targetEntity="FinData", mappedBy="captionCategory")
     * @Exclude
     */
    private $finData;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->finData = new \Doctrine\Common\Collections\ArrayCollection();
    }

    /**
     * Set id
     *
     * @param integer $id
     * @return CaptionCategory
     */
    public function setId($id)
    {
        $this->id = $id;

        return $this;
    }

    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set name
     *
     * @param string $name
     * @return CaptionCategory
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * Get name
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Set display
     *
     * @param boolean $display
     * @return CaptionCategory
     */
    public function setDisplay($display)
    {
        $this->display = $display;

        return $this;
    }

    /**
     * Get display
     *
     * @return boolean
     */
    public function getDisplay()
    {
        return $this->display;
    }

    /**
     * Add finData
     *
     * @param \GovWiki\DbBundle\Entity\FinData $finData
     * @return CaptionCategory
     */
    public function addFinDatum(\GovWiki\DbBundle\Entity\FinData $finData)
    {
        $this->finData[] = $finData;

        return $this;
    }

    /**
     * Remove finData
     *
     * @param \GovWiki\DbBundle\Entity\FinData $finData
     */
    public function removeFinDatum(\GovWiki\DbBundle\Entity\FinData $finData)
    {
        $this->finData->removeElement($finData);
    }

    /**
     * Get finData
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getFinData()
    {
        return $this->finData;
    }
}
