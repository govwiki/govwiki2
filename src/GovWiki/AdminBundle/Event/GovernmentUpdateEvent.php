<?php

namespace GovWiki\AdminBundle\Event;

use GovWiki\DbBundle\Entity\Government;
use Symfony\Component\EventDispatcher\Event;

/**
 * Class GovernmentUpdateEvent
 * @package GovWiki\AdminBundle\Event
 */
class GovernmentUpdateEvent extends Event
{

    /**
     * @var Government
     */
    private $oldGovernment;

    /**
     * @var Government
     */
    private $newGovernment;

    /**
     * @param Government $oldGovernment Government entity before update.
     * @param Government $newGovernment Government entity after update.
     */
    public function __construct(
        Government $oldGovernment,
        Government $newGovernment
    ) {
        $this->$oldGovernment = $oldGovernment;
        $this->newGovernment = $newGovernment;
    }

    /**
     * @return Government
     */
    public function getOldGovernment()
    {
        return $this->oldGovernment;
    }

    /**
     * @param Government $oldGovernment Government entity before update.
     *
     * @return GovernmentUpdateEvent
     */
    public function setOldGovernment($oldGovernment)
    {
        $this->oldGovernment = $oldGovernment;

        return $this;
    }

    /**
     * @return Government
     */
    public function getNewGovernment()
    {
        return $this->newGovernment;
    }

    /**
     * @param Government $newGovernment Government entity after update.
     *
     * @return GovernmentUpdateEvent
     */
    public function setNewGovernment($newGovernment)
    {
        $this->newGovernment = $newGovernment;

        return $this;
    }
}
