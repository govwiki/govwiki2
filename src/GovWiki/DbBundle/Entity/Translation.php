<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Translation
 *
 * @ORM\Table(name="translations")
 * @ORM\Entity(repositoryClass="GovWiki\DbBundle\Entity\Repository\TranslationRepository")
 */
class Translation
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
     * @ORM\Column(name="trans_key", type="string", length=255)
     */
    private $transKey;

    /**
     * @var string
     *
     * @ORM\Column(name="message_domain", type="string", length=255)
     */
    private $messageDomain;

    /**
     * @var string
     *
     * @ORM\Column(name="translation", type="text")
     */
    private $translation;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="date_created", type="datetime")
     */
    private $dateCreated;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="date_updated", type="datetime")
     */
    private $dateUpdated;

    /**
     * @var AbstractLocale
     *
     * @ORM\ManyToOne(targetEntity="AbstractLocale", inversedBy="translations")
     * @ORM\JoinColumn(name="locale_id", referencedColumnName="id")
     */
    private $locale;

    /**
     * @var string
     *
     * @ORM\Column(name="trans_textarea_type", type="string", length=15)
     */
    private $transTextareaType;


    /**
     *
     */
    public function __construct()
    {
        $this->messageDomain = 'messages';
        $this->translation = '';
        $this->dateCreated = new \DateTime();
        $this->dateUpdated = new \DateTime();
        $this->transTextareaType = 'textarea';
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
     * Set transKey
     *
     * @param string $transKey
     * @return Translation
     */
    public function setTransKey($transKey)
    {
        $this->transKey = $transKey;

        return $this;
    }

    /**
     * Get transKey
     *
     * @return string 
     */
    public function getTransKey()
    {
        return $this->transKey;
    }

    /**
     * Set messageDomain
     *
     * @param string $messageDomain
     * @return Translation
     */
    public function setMessageDomain($messageDomain)
    {
        $this->messageDomain = $messageDomain;

        return $this;
    }

    /**
     * Get messageDomain
     *
     * @return string 
     */
    public function getMessageDomain()
    {
        return $this->messageDomain;
    }

    /**
     * Set translation
     *
     * @param string $translation
     * @return Translation
     */
    public function setTranslation($translation)
    {
        $this->translation = \trim($translation);

        return $this;
    }

    /**
     * Get translation
     *
     * @return string 
     */
    public function getTranslation()
    {
        return $this->translation;
    }

    /**
     * Set dateCreated
     *
     * @param \DateTime $dateCreated
     * @return Translation
     */
    public function setDateCreated($dateCreated)
    {
        $this->dateCreated = $dateCreated;

        return $this;
    }

    /**
     * Get dateCreated
     *
     * @return \DateTime 
     */
    public function getDateCreated()
    {
        return $this->dateCreated;
    }

    /**
     * Set dateUpdated
     *
     * @param \DateTime $dateUpdated
     * @return Translation
     */
    public function setDateUpdated($dateUpdated)
    {
        $this->dateUpdated = $dateUpdated;

        return $this;
    }

    /**
     * Get dateUpdated
     *
     * @return \DateTime 
     */
    public function getDateUpdated()
    {
        return $this->dateUpdated;
    }

    /**
     * Set locale
     *
     * @param AbstractLocale $locale
     * @return Translation
     */
    public function setLocale(AbstractLocale $locale = null)
    {
        $this->locale = $locale;

        return $this;
    }

    /**
     * Get locale
     *
     * @return AbstractLocale
     */
    public function getLocale()
    {
        return $this->locale;
    }

    /**
     * Set transTextareaType
     *
     * @param string $transTextareaType
     * @return Translation
     */
    public function setTransTextareaType($transTextareaType)
    {
        $this->transTextareaType = $transTextareaType;

        return $this;
    }

    /**
     * Get transTextareaType
     *
     * @return string 
     */
    public function getTransTextareaType()
    {
        return $this->transTextareaType;
    }
}
