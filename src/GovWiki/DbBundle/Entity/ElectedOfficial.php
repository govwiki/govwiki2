<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation\ExclusionPolicy;
use JMS\Serializer\Annotation\Exclude;
use JMS\Serializer\Annotation\Groups;
use JMS\Serializer\Annotation\VirtualProperty;

/**
 * ElectedOfficial
 *
 * @ORM\Table(name="elected_officials")
 * @ORM\Entity(repositoryClass="GovWiki\DbBundle\Entity\Repository\ElectedOfficialRepository")
 * @ExclusionPolicy("none")
 */
class ElectedOfficial
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     * @Groups({"government", "elected_official"})
     */
    private $id;

    /**
     * @var Government
     *
     * @ORM\ManyToOne(targetEntity="Government", inversedBy="electedOfficials")
     * @Groups({"elected_official"})
     */
    private $government;

    /**
     * @var string
     *
     * @ORM\Column(name="full_name", type="string", length=255, nullable=true)
     * @Groups({"government", "elected_official"})
     */
    private $fullName;

    /**
     * @var string
     *
     * @ORM\Column(name="slug", type="string", length=255, nullable=true)
     * @Groups({"government", "elected_official"})
     */
    private $slug;

    /**
     * @var integer
     *
     * @ORM\Column(name="display_order", type="integer", nullable=true)
     * @Groups({"government", "elected_official"})
     */
    private $displayOrder;

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", length=255, nullable=true)
     * @Groups({"government", "elected_official"})
     */
    private $title;

    /**
     * @var string
     *
     * @ORM\Column(name="email_address", type="string", length=255, nullable=true)
     * @Groups({"government", "elected_official"})
     */
    private $emailAddress;

    /**
     * @var string
     *
     * @ORM\Column(name="telephone_number", type="string", length=255, nullable=true)
     * @Groups({"government", "elected_official"})
     */
    private $telephoneNumber;

    /**
     * @var string
     *
     * @ORM\Column(name="photo_url", type="string", length=255, nullable=true)
     * @Groups({"government", "elected_official"})
     */
    private $photoUrl;

    /**
     * @var string
     *
     * @ORM\Column(name="bio_url", type="string", length=255, nullable=true)
     * @Groups({"government", "elected_official"})
     */
    private $bioUrl;

    /**
     * @var string
     *
     * @ORM\Column(name="term_expires", type="string", length=255, nullable=true)
     * @Groups({"government", "elected_official"})
     */
    private $termExpires;

    /**
     * @ORM\OneToMany(targetEntity="Contribution", mappedBy="electedOfficial")
     * @Groups({"elected_official"})
     */
    private $contributions;

    /**
     * @ORM\OneToMany(targetEntity="Endorsement", mappedBy="electedOfficial")
     * @Groups({"elected_official"})
     */
    private $endorsements;

    /**
     * @ORM\OneToMany(targetEntity="PublicStatement", mappedBy="electedOfficial")
     * @Groups({"elected_official"})
     */
    private $publicStatements;

    /**
     * @ORM\OneToMany(targetEntity="ElectedOfficialVote", mappedBy="electedOfficial")
     * @Groups({"elected_official"})
     */
    private $votes;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->contributions     = new \Doctrine\Common\Collections\ArrayCollection();
        $this->endorsements      = new \Doctrine\Common\Collections\ArrayCollection();
        $this->publicStatements  = new \Doctrine\Common\Collections\ArrayCollection();
        $this->votes             = new \Doctrine\Common\Collections\ArrayCollection();
    }

    /**
     * @return string
     */
    public function __toString()
    {
        return $this->fullName;
    }

    /**
     * Set id
     *
     * @param int $id
     * @return ElectedOfficial
     */
    public function setId($id)
    {
        $this->id = $id;

        return $this;
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
     * Set government
     *
     * @param \GovWiki\DbBundle\Entity\Government $government
     * @return ElectedOfficial
     */
    public function setGovernment(\GovWiki\DbBundle\Entity\Government $government = null)
    {
        $this->government = $government;

        return $this;
    }

    /**
     * Get government
     *
     * @return \GovWiki\DbBundle\Entity\Government
     */
    public function getGovernment()
    {
        return $this->government;
    }

    /**
     * Set fullName
     *
     * @param string $fullName
     * @return ElectedOfficial
     */
    public function setFullName($fullName)
    {
        $this->fullName = $fullName;
        $this->slug     = $this->sanitize($fullName);

        return $this;
    }

    /**
     * Get fullName
     *
     * @return string
     */
    public function getFullName()
    {
        return $this->fullName;
    }

    /**
     * Set slug
     *
     * @param string $slug
     * @return ElectedOfficial
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;

        return $this;
    }

    /**
     * Get slug
     *
     * @return string
     */
    public function getSlug()
    {
        return $this->slug;
    }

    /**
     * Set displayOrder
     *
     * @param integer $displayOrder
     * @return ElectedOfficial
     */
    public function setDisplayOrder($displayOrder)
    {
        $this->displayOrder = $displayOrder;

        return $this;
    }

    /**
     * Get displayOrder
     *
     * @return integer
     */
    public function getDisplayOrder()
    {
        return $this->displayOrder;
    }

    /**
     * Set title
     *
     * @param string $title
     * @return ElectedOfficial
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * Get title
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * Set emailAddress
     *
     * @param string $emailAddress
     * @return ElectedOfficial
     */
    public function setEmailAddress($emailAddress)
    {
        $this->emailAddress = $emailAddress;

        return $this;
    }

    /**
     * Get emailAddress
     *
     * @return string
     */
    public function getEmailAddress()
    {
        return $this->emailAddress;
    }

    /**
     * Set telephoneNumber
     *
     * @param string $telephoneNumber
     * @return ElectedOfficial
     */
    public function setTelephoneNumber($telephoneNumber)
    {
        $this->telephoneNumber = $telephoneNumber;

        return $this;
    }

    /**
     * Get telephoneNumber
     *
     * @return string
     */
    public function getTelephoneNumber()
    {
        return $this->telephoneNumber;
    }

    /**
     * Set photoUrl
     *
     * @param string $photoUrl
     * @return ElectedOfficial
     */
    public function setPhotoUrl($photoUrl)
    {
        $this->photoUrl = $photoUrl;

        return $this;
    }

    /**
     * Get photoUrl
     *
     * @return string
     */
    public function getPhotoUrl()
    {
        return $this->photoUrl;
    }

    /**
     * Set bioUrl
     *
     * @param string $bioUrl
     * @return ElectedOfficial
     */
    public function setBioUrl($bioUrl)
    {
        $this->bioUrl = $bioUrl;

        return $this;
    }

    /**
     * Get bioUrl
     *
     * @return string
     */
    public function getBioUrl()
    {
        return $this->bioUrl;
    }

    /**
     * Set termExpires
     *
     * @param string $termExpires
     * @return ElectedOfficial
     */
    public function setTermExpires($termExpires)
    {
        $this->termExpires = $termExpires;

        return $this;
    }

    /**
     * Get termExpires
     *
     * @return string
     */
    public function getTermExpires()
    {
        return $this->termExpires;
    }

    /**
     * Add contributions
     *
     * @param \GovWiki\DbBundle\Entity\Contribution $contributions
     * @return ElectedOfficial
     */
    public function addContribution(\GovWiki\DbBundle\Entity\Contribution $contributions)
    {
        $this->contributions[] = $contributions;

        return $this;
    }

    /**
     * Remove contributions
     *
     * @param \GovWiki\DbBundle\Entity\Contribution $contributions
     */
    public function removeContribution(\GovWiki\DbBundle\Entity\Contribution $contributions)
    {
        $this->contributions->removeElement($contributions);
    }

    /**
     * Get contributions
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getContributions()
    {
        return $this->contributions;
    }

    /**
     * Add endorsements
     *
     * @param \GovWiki\DbBundle\Entity\Endorsement $endorsements
     * @return ElectedOfficial
     */
    public function addEndorsement(\GovWiki\DbBundle\Entity\Endorsement $endorsements)
    {
        $this->endorsements[] = $endorsements;

        return $this;
    }

    /**
     * Remove endorsements
     *
     * @param \GovWiki\DbBundle\Entity\Endorsement $endorsements
     */
    public function removeEndorsement(\GovWiki\DbBundle\Entity\Endorsement $endorsements)
    {
        $this->endorsements->removeElement($endorsements);
    }

    /**
     * Get endorsements
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getEndorsements()
    {
        return $this->endorsements;
    }

    /**
     * Add publicStatements
     *
     * @param \GovWiki\DbBundle\Entity\PublicStatement $publicStatements
     * @return ElectedOfficial
     */
    public function addPublicStatement(\GovWiki\DbBundle\Entity\PublicStatement $publicStatements)
    {
        $this->publicStatements[] = $publicStatements;

        return $this;
    }

    /**
     * Remove publicStatements
     *
     * @param \GovWiki\DbBundle\Entity\PublicStatement $publicStatements
     */
    public function removePublicStatement(\GovWiki\DbBundle\Entity\PublicStatement $publicStatements)
    {
        $this->publicStatements->removeElement($publicStatements);
    }

    /**
     * Get publicStatements
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getPublicStatements()
    {
        return $this->publicStatements;
    }

    /**
     * Add votes
     *
     * @param \GovWiki\DbBundle\Entity\ElectedOfficialVote $votes
     * @return ElectedOfficial
     */
    public function addVote(\GovWiki\DbBundle\Entity\ElectedOfficialVote $votes)
    {
        $this->votes[] = $votes;

        return $this;
    }

    /**
     * Remove votes
     *
     * @param \GovWiki\DbBundle\Entity\ElectedOfficialVote $votes
     */
    public function removeVote(\GovWiki\DbBundle\Entity\ElectedOfficialVote $votes)
    {
        $this->votes->removeElement($votes);
    }

    /**
     * Get votes
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getVotes()
    {
        return $this->votes;
    }

    /**
     * @VirtualProperty
     *
     * @return string
     */
    public function getGovName()
    {
        $government = $this->government;
        if ($government) {
            return $government->getName();
        }

        return '';
    }

    /**
     * @VirtualProperty
     *
     * @return string
     */
    public function getGovAltName()
    {
        $government = $this->government;
        if ($government) {
            return str_replace('_', ' ', $government->getSlug());
        }

        return '';
    }

    /**
     * Sanitize
     *
     * @param  string $str
     * @param  array  $replace
     * @param  string $delimiter
     * @return string
     */
    private function sanitize($str, $replace = [], $delimiter = '_') {
        if (!empty($replace)) {
            $str = str_replace((array)$replace, ' ', $str);
        }

        $clean = iconv('UTF-8', 'ASCII//TRANSLIT', $str);
        $clean = preg_replace("/[^a-zA-Z0-9\/_|+ -]/", '', $clean);
        $clean = ucwords(strtolower(trim($clean, '_')));
        $clean = preg_replace("/[\/_|+ -]+/", $delimiter, trim($clean));

        return $clean;
    }
}
