<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;

/**
 * Environment
 *
 * @ORM\Table(name="environments")
 * @ORM\Entity(
 *  repositoryClass="GovWiki\DbBundle\Entity\Repository\EnvironmentRepository"
 * )
 *
 * @UniqueEntity("name")
 */
class Environment
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
     * @ORM\Column(unique=true)
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column()
     */
    private $domain;

    /**
     * @var string
     *
     * @ORM\Column(type="text")
     */
    private $header;

    /**
     * @var string
     *
     * @ORM\Column(type="text")
     */
    private $greetingText;

    /**
     * @var string
     *
     * @ORM\Column(type="text")
     */
    private $footer;

    /**
     * @var boolean
     *
     * @ORM\Column(type="boolean")
     */
    private $enabled = false;

    /**
     * @var Map
     *
     * @ORM\OneToOne(
     *  targetEntity="Map",
     *  inversedBy="environment",
     *  cascade={"remove"}
     *)
     * @ORM\JoinColumn(name="map_id")
     */
    private $map;

    /**
     * @var Format
     *
     * @ORM\OneToOne(
     *  targetEntity="Format",
     *  inversedBy="environment",
     *  cascade={"remove"}
     *)
     * @ORM\JoinColumn(name="format_id")
     */
    private $format;

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
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string $name
     *
     * @return Environment
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * @return string
     */
    public function getDomain()
    {
        return $this->domain;
    }

    /**
     * @param string $domain
     *
     * @return Environment
     */
    public function setDomain($domain)
    {
        $this->domain = $domain;

        return $this;
    }

    /**
     * @return string
     */
    public function getHeader()
    {
        return $this->header;
    }

    /**
     * @param string $header
     *
     * @return Environment
     */
    public function setHeader($header)
    {
        $this->header = $header;

        return $this;
    }

    /**
     * @return string
     */
    public function getGreetingText()
    {
        return $this->greetingText;
    }

    /**
     * @param string $greetingText
     *
     * @return Environment
     */
    public function setGreetingText($greetingText)
    {
        $this->greetingText = $greetingText;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getFooter()
    {
        return $this->footer;
    }

    /**
     * @param mixed $footer
     *
     * @return Environment
     */
    public function setFooter($footer)
    {
        $this->footer = $footer;

        return $this;
    }

    /**
     * @return boolean
     */
    public function isEnabled()
    {
        return $this->enabled;
    }

    /**
     * @param boolean $enabled
     */
    public function setEnabled($enabled)
    {
        $this->enabled = $enabled;

        return $this;
    }

    /**
     * @return Map
     */
    public function getMap()
    {
        return $this->map;
    }

    /**
     * @param Map $map A Map instance.
     *
     * @return Environment
     */
    public function setMap(Map $map)
    {
        $this->map = $map;

        return $this;
    }

    /**
     * @return Format
     */
    public function getFormat()
    {
        return $this->format;
    }

    /**
     * @param Format $format A Format instance.
     *
     * @return Environment
     */
    public function setFormat(Format $format)
    {
        $this->format = $format;

        return $this;
    }
}
