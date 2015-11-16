<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation\ExclusionPolicy;
use JMS\Serializer\Annotation\Exclude;
use JMS\Serializer\Annotation\Groups;

/**
 * IssueCategory
 *
 * @ORM\Table(name="issue_categories")
 * @ORM\Entity
 * @ExclusionPolicy("none")
 */
class IssueCategory
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     * @Groups({"elected_official"})
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="name", type="string", length=255, nullable=true)
     * @Groups({"elected_official"})
     */
    private $name;

    /**
     * @ORM\OneToMany(targetEntity="Legislation", mappedBy="issueCategory")
     * @Exclude
     */
    private $legislations;

    /**
     * @ORM\OneToMany(targetEntity="Endorsement", mappedBy="issueCategory")
     * @Exclude
     */
    private $endorsements;

    /**
     * @ORM\OneToMany(targetEntity="PublicStatement", mappedBy="issueCategory")
     * @Exclude
     */
    private $publicStatements;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->legislations     = new \Doctrine\Common\Collections\ArrayCollection();
        $this->endorsements     = new \Doctrine\Common\Collections\ArrayCollection();
        $this->publicStatements = new \Doctrine\Common\Collections\ArrayCollection();
    }

    /**
     * To string
     *
     * @return string
     */
    public function __toString()
    {
        return $this->name;
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
     * Set name
     *
     * @param string $name
     * @return IssueCategory
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
     * Add legislations
     *
     * @param \GovWiki\DbBundle\Entity\Legislation $legislations
     * @return IssueCategory
     */
    public function addLegislation(\GovWiki\DbBundle\Entity\Legislation $legislations)
    {
        $this->legislations[] = $legislations;

        return $this;
    }

    /**
     * Remove legislations
     *
     * @param \GovWiki\DbBundle\Entity\Legislation $legislations
     */
    public function removeLegislation(\GovWiki\DbBundle\Entity\Legislation $legislations)
    {
        $this->legislations->removeElement($legislations);
    }

    /**
     * Get legislations
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getLegislations()
    {
        return $this->legislations;
    }

    /**
     * Add endorsements
     *
     * @param \GovWiki\DbBundle\Entity\Endorsement $endorsements
     * @return IssueCategory
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
     * @return IssueCategory
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
}
