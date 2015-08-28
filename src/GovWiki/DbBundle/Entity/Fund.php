<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Fund
 *
 * @ORM\Table(name="funds")
 * @ORM\Entity
 */
class Fund
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
     */
    private $name;

    /**
     * @var boolean
     *
     * @ORM\Column(name="display", type="boolean", nullable=true)
     */
    private $display;

    /**
     * @ORM\OneToMany(targetEntity="FinData", mappedBy="fund")
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
     * @return Fund
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
     * @return Fund
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
     * @return Fund
     */
    public function addFinData(\GovWiki\DbBundle\Entity\FinData $finData)
    {
        $this->finData[] = $finData;

        return $this;
    }

    /**
     * Remove finData
     *
     * @param \GovWiki\DbBundle\Entity\FinData $finData
     */
    public function removeFinData(\GovWiki\DbBundle\Entity\FinData $finData)
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
