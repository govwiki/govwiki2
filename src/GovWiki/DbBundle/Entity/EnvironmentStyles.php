<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Environment styles
 *
 * @ORM\Table(name="environment_styles")
 * @ORM\Entity()
 */
class EnvironmentStyles
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
     * @ORM\ManyToOne(targetEntity="Environment")
     */
    private $environment;

    /**
     * @var string
     *
     * @ORM\Column(name="name", type="string", length=255)
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column(name="class_name", type="string", length=255)
     */
    private $className;

    /**
     * @var string
     *
     * @ORM\Column(name="properties", type="string", length=255)
     */
    private $properties;

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
     * @return $this
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
     * Set className
     *
     * @param string $className
     * @return $this
     */
    public function setClassName($className)
    {
        $this->className = $className;

        return $this;
    }

    /**
     * Get className
     *
     * @return string
     */
    public function getClassName()
    {
        return $this->className;
    }

    /**
     * Set properties
     *
     * @param string $properties
     * @return $this
     */
    public function setProperties($properties)
    {
        $this->properties = $properties;

        return $this;
    }

    /**
     * Get properties
     *
     * @param boolean $notJson
     * @return string
     */
    public function getProperties($notJson = null)
    {
        if ($notJson) {
            return $this->properties;
        }

        return json_decode($this->properties);
    }

    /**
     * Set environment
     *
     * @param object $environment
     * @return $this
     */
    public function setEnvironment($environment = null)
    {
        $this->environment = $environment;

        return $this;
    }

    /**
     * Get environment
     *
     * @return $this
     */
    public function getEnvironment()
    {
        return $this->environment;
    }
}
