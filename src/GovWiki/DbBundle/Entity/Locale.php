<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;

/**
 * Locale
 *
 * @ORM\Table(name="locales")
 * @ORM\Entity(repositoryClass="GovWiki\DbBundle\Entity\Repository\LocaleRepository")
 */
class Locale
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
     * @ORM\OneToMany(targetEntity="Translation", mappedBy="locale", cascade={"remove"})
     */
    private $translations;

    /**
     * @ORM\ManyToOne(targetEntity="Environment", inversedBy="locales")
     * @ORM\JoinColumn(name="environment_id", referencedColumnName="id")
     */
    private $environment;


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
     * @param \GovWiki\DbBundle\Entity\Translation $translations
     * @return Locale
     */
    public function addTranslation(\GovWiki\DbBundle\Entity\Translation $translations)
    {
        $this->translations[] = $translations;

        return $this;
    }

    /**
     * Remove translations
     *
     * @param \GovWiki\DbBundle\Entity\Translation $translations
     */
    public function removeTranslation(\GovWiki\DbBundle\Entity\Translation $translations)
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
     * @param \GovWiki\DbBundle\Entity\Environment $environment
     * @return Locale
     */
    public function setEnvironment(\GovWiki\DbBundle\Entity\Environment $environment = null)
    {
        $this->environment = $environment;

        return $this;
    }

    /**
     * Get environment
     *
     * @return \GovWiki\DbBundle\Entity\Environment 
     */
    public function getEnvironment()
    {
        return $this->environment;
    }
}
