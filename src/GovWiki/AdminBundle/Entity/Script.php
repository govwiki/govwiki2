<?php

namespace GovWiki\AdminBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="script_mapping")
 * @ORM\Entity
 */
class Script
{

    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="bigint", length=20)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=200)
     *
     * @var string
     */
    private $name;

    /**
     * @ORM\Column(type="string", length=1000)
     *
     * @var string
     */
    private $executable;

    /**
     * @ORM\Column(type="simple_array")
     *
     * @var array
     */
    private $paramCategories;

    /**
     * @return integer
     */
    public function getId(): int
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getName(): string
    {
        return $this->name;
    }

    /**
     * @param string $name Script name.
     *
     * @return $this
     */
    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    /**
     * @return string
     */
    public function getExecutable(): string
    {
        return $this->executable;
    }

    /**
     * @param string $executable Path to script executable.
     *
     * @return $this
     */
    public function setExecutable(string $executable): self
    {
        $this->executable = $executable;

        return $this;
    }

    /**
     * @return array
     */
    public function getParamCategories(): array
    {
        return $this->paramCategories;
    }

    /**
     * @param array $paramCategories Used param categories.
     *
     * @return $this
     */
    public function setParamCategories(array $paramCategories): self
    {
        $this->paramCategories = $paramCategories;

        return $this;
    }
}
