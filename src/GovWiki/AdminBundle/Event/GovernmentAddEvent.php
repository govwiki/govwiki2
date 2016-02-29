<?php

namespace GovWiki\AdminBundle\Event;

use GovWiki\DbBundle\Entity\Government;
use Symfony\Component\EventDispatcher\Event;

/**
 * Class GovernmentAddEvent
 * @package GovWiki\AdminBundle\Event
 */
class GovernmentAddEvent extends Event
{

    /**
     * @var Government
     */
    private $government;

    /**
     * @var array
     */
    private $colorizedData;

    /**
     * @param Government $government    A Government instance.
     * @param float      $colorizedData Data choose for colorized conditions.
     */
    public function __construct(Government $government, $colorizedData)
    {
        $this->government = $government;
        $this->colorizedData = $colorizedData;
    }

    /**
     * @return Government
     */
    public function getGovernment()
    {
        return $this->government;
    }

    /**
     * @param Government $government A Government instance.
     *
     * @return GovernmentAddEvent
     */
    public function setGovernment(Government $government)
    {
        $this->government = $government;

        return $this;
    }

    /**
     * @return array
     */
    public function getColorizedData()
    {
        return $this->colorizedData;
    }

    /**
     * @param float $colorizedData Data choose for colorized conditions.
     *
     * @return GovernmentAddEvent
     */
    public function setColorizedData($colorizedData)
    {
        $this->colorizedData = $colorizedData;

        return $this;
    }
}
