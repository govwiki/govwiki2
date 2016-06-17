<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Environment styles
 *
 * @ORM\Table(name="environment_styles")
 * @ORM\Entity(
 *  repositoryClass="GovWiki\DbBundle\Entity\Repository\EnvironmentStylesRepository"
 * )
 */
class EnvironmentStyles
{

    const DESKTOP = 'desktop';
    const MOBILE = 'mobile';

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
     * @var string
     *
     * @ORM\Column()
     */
    private $type;

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
     * @param string $name Style name.
     *
     * @return EnvironmentStyles
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
     * @param string $className Css selector.
     *
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
     * @param string $properties Css rules.
     *
     * @return EnvironmentStyles
     */
    public function setProperties($properties)
    {
        $this->properties = $properties;

        return $this;
    }

    /**
     * Get properties
     *
     * @param boolean $notJson Flag, if set return json string.
     *
     * @return array|string
     */
    public function getProperties($notJson = false)
    {
        if ($notJson) {
            return $this->properties;
        }

        return json_decode($this->properties);
    }

    /**
     * Set environment
     *
     * @param Environment $environment A Environment entity instance.
     *
     * @return EnvironmentStyles
     */
    public function setEnvironment(Environment $environment = null)
    {
        $this->environment = $environment;

        return $this;
    }

    /**
     * Get environment
     *
     * @return EnvironmentStyles
     */
    public function getEnvironment()
    {
        return $this->environment;
    }

    /**
     * Set type
     *
     * @param string $type Desktop or mobile.
     *
     * @return EnvironmentStyles
     */
    public function setType($type)
    {
        $this->type = $type;

        return $this;
    }

    /**
     * Get type
     *
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }
}
