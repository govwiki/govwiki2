<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 *
 * @ORM\Table(name="locales")
 * @ORM\Entity(
 *  repositoryClass="GovWiki\DbBundle\Entity\Repository\LocaleRepository"
 * )
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\MappedSuperclass()
 * @ORM\DiscriminatorColumn(name="type", type="string")
 * @ORM\DiscriminatorMap({
 *  "environment"="Locale",
 *  "global"="GlobalLocale"
 * })
 */
abstract class AbstractLocale
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
     * @ORM\Column(name="short_name", type="string", length=5)
     */
    private $shortName;

    /**
     * @var Collection
     *
     * @ORM\OneToMany(targetEntity="Translation", mappedBy="locale", cascade={"remove"})
     */
    private $translations;

    /**
     * @ORM\ManyToOne(targetEntity="Environment", inversedBy="locales")
     * @ORM\JoinColumn(name="environment_id", referencedColumnName="id")
     */
    private $environment;

    /**
     * @return string
     */
    public function __toString()
    {
        return $this->shortName;
    }

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->translations = new ArrayCollection();
    }

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
     * Set shortName
     *
     * @param string $shortName
     * @return Locale
     */
    public function setShortName($shortName)
    {
        $this->shortName = $shortName;

        return $this;
    }

    /**
     * Get shortName
     *
     * @return string
     */
    public function getShortName()
    {
        return $this->shortName;
    }

    /**
     * Add translations
     *
     * @param Translation $translations
     * @return Locale
     */
    public function addTranslation(Translation $translations)
    {
        $this->translations[] = $translations;

        return $this;
    }

    /**
     * Remove translations
     *
     * @param Translation $translations
     */
    public function removeTranslation(Translation $translations)
    {
        $this->translations->removeElement($translations);
    }

    /**
     * Get translations
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getTranslations()
    {
        return $this->translations;
    }

    /**
     * Set environment
     *
     * @param Environment $environment
     * @return Locale
     */
    public function setEnvironment(Environment $environment = null)
    {
        $this->environment = $environment;

        return $this;
    }

    /**
     * Get environment
     *
     * @return Environment
     */
    public function getEnvironment()
    {
        return $this->environment;
    }
}
