<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Twilio sms messages
 *
 * @ORM\Table(name="twilio_sms_messages")
 * @ORM\Entity()
 */
class TwilioSmsMessages
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
     * @ORM\Column(type="string")
     */
    private $fromNumber;

    /**
     * @ORM\Column(type="string")
     */
    private $toNumber;

    /**
     * @ORM\Column(type="string")
     */
    private $message;

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    private $error;

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
     * Set fromNumber
     *
     * @param string $fromNumber
     * @return TwilioSmsMessages
     */
    public function setFromNumber($fromNumber)
    {
        $this->fromNumber = $fromNumber;

        return $this;
    }

    /**
     * Get fromNumber
     *
     * @return string
     */
    public function getFromNumber()
    {
        return $this->fromNumber;
    }

    /**
     * Set toNumber
     *
     * @param string $toNumber
     * @return TwilioSmsMessages
     */
    public function setToNumber($toNumber)
    {
        $this->toNumber = $toNumber;

        return $this;
    }

    /**
     * Get toNumber
     *
     * @return string
     */
    public function getToNumber()
    {
        return $this->toNumber;
    }

    /**
     * Set message
     *
     * @param string $message
     * @return TwilioSmsMessages
     */
    public function setMessage($message)
    {
        $this->message = $message;

        return $this;
    }

    /**
     * Get message
     *
     * @return string
     */
    public function getMessage()
    {
        return $this->message;
    }

    /**
     * Set error
     *
     * @param string $error
     * @return TwilioSmsMessages
     */
    public function setError($error)
    {
        $this->error = $error;

        return $this;
    }

    /**
     * Get error
     *
     * @return string
     */
    public function getError()
    {
        return $this->error;
    }
}
