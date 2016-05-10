<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Advertising
 *
 * @ORM\Table(name="advertising")
 * @ORM\Entity()
 */
class Advertising
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
     * @var Environment
     *
     * @ORM\ManyToOne(targetEntity="Environment", inversedBy="advertising")
     */
    private $environment;

    /**
     * @var string
     *
     * @ORM\Column(name="adverting_type", type="string", length=255)
     */
    private $advertingType;

    /**
     * @var string
     *
     * @ORM\Column(name="adverting_enable", type="boolean")
     */
    private $advertingEnable = false;

    /**
     * @var string
     *
     * @Assert\NotBlank()
     * @ORM\Column(name="adverting_code", type="text")
     */
    private $advertingCode;

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
     * @return Environment
     */
    public function getEnvironment()
    {
        return $this->environment;
    }

    /**
     * @param Environment $environment A Environment instance.
     *
     * @return Government
     */
    public function setEnvironment(Environment $environment)
    {
        $this->environment = $environment;

        return $this;
    }

    /**
     * Set advertingType
     *
     * @param string $advertingType
     * @return Adverting
     */
    public function setAdvertingType($advertingType)
    {
        $this->advertingType = $advertingType;

        return $this;
    }

    /**
     * Get advertingType
     *
     * @return string
     */
    public function getAdvertingType()
    {
        return $this->advertingType;
    }

    /**
     * Set advertingEnable
     *
     * @param boolean $advertingEnable
     * @return Adverting
     */
    public function setAdvertingEnable($advertingEnable)
    {
        $this->advertingEnable = $advertingEnable;

        return $this;
    }

    /**
     * Get advertingEnable
     *
     * @return boolean
     */
    public function getAdvertingEnable()
    {
        return $this->advertingEnable;
    }

    /**
     * Set advertingCode
     *
     * @param string $advertingCode
     * @return Adverting
     */
    public function setAdvertingCode($advertingCode)
    {
        $this->advertingCode = $advertingCode;

        return $this;
    }

    /**
     * Get advertingCode
     *
     * @return string
     */
    public function getAdvertingCode()
    {
        return $this->advertingCode;
    }
}
