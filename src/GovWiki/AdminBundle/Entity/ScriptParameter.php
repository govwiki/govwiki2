<?php

namespace GovWiki\AdminBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="script_parameters")
 * @ORM\Entity(
 *  repositoryClass="GovWiki\AdminBundle\Entity\Repository\ScriptParameterRepository"
 * )
 */
class ScriptParameter
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
    private $category;

    /**
     * @ORM\Column(type="string", length=200)
     *
     * @var string
     */
    private $key;

    /**
     * @ORM\Column(type="string", length=2000, nullable=true)
     *
     * @var string|null
     */
    private $value;

    /**
     * @ORM\Column(type="text")
     *
     * @var string
     */
    private $description;

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
    public function getCategory(): string
    {
        return $this->category;
    }

    /**
     * @param string $category Script parameter category.
     *
     * @return $this
     */
    public function setCategory(string $category): self
    {
        $this->category = $category;

        return $this;
    }

    /**
     * @return string
     */
    public function getKey(): string
    {
        return $this->key;
    }

    /**
     * @param string $key Parameter key.
     *
     * @return $this
     */
    public function setKey(string $key): self
    {
        $this->key = $key;

        return $this;
    }

    /**
     * @return string|null
     */
    public function getValue()
    {
        return $this->value;
    }

    /**
     * @param string|null $value Parameter value.
     *
     * @return $this
     */
    public function setValue($value): self
    {
        $this->value = $value;

        return $this;
    }

    /**
     * @return string
     */
    public function getDescription(): string
    {
        return $this->description;
    }

    /**
     * @param string $description Parameter description.
     *
     * @return $this
     */
    public function setDescription(string $description): self
    {
        $this->description = $description;

        return $this;
    }
}
