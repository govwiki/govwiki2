<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * TriggerSchool
 *
 * @ORM\Table(name="trigger_schools")
 * @ORM\Entity
 */
class TriggerSchool
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
     * @ORM\Column(name="state_id", type="string", length=255, nullable=true)
     */
    private $stateId;

    /**
     * @var string
     *
     * @ORM\Column(name="trigger_schools", type="string", length=255, nullable=true)
     */
    private $triggerSchools;

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
     * Set stateId
     *
     * @param string $stateId
     * @return TriggerSchool
     */
    public function setStateId($stateId)
    {
        $this->stateId = $stateId;

        return $this;
    }

    /**
     * Get stateId
     *
     * @return string
     */
    public function getStateId()
    {
        return $this->stateId;
    }

    /**
     * Set triggerSchools
     *
     * @param string $triggerSchools
     * @return TriggerSchool
     */
    public function setTriggerSchools($triggerSchools)
    {
        $this->triggerSchools = $triggerSchools;

        return $this;
    }

    /**
     * Get triggerSchools
     *
     * @return string
     */
    public function getTriggerSchools()
    {
        return $this->triggerSchools;
    }
}
