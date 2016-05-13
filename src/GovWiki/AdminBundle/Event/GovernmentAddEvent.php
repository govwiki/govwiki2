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
    public $government;

    /**
     * @var array
     */
    public $data;

    /**
     * @param Government $government A Government entity instance.
     * @param float      $data       Environment related government data.
     */
    public function __construct(Government $government, $colorizedData)
    {
        $this->government = $government;
        $this->data = $data;
    }
}
