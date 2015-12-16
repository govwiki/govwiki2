<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation\ExclusionPolicy;
use JMS\Serializer\Annotation\Exclude;
use JMS\Serializer\Annotation\Groups;

/**
 * Legislation
 *
 * @ORM\Table(name="legislations")
 * @ORM\Entity(
 *  repositoryClass="GovWiki\DbBundle\Entity\Repository\LegislationRepository"
 * )
 * @ExclusionPolicy("none")
 */
class Legislation
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
     * @ORM\Column(name="gov_assigned_number", type="string", length=255, nullable=true)
     * @Groups({"elected_official"})
     */
    private $govAssignedNumber;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="date_considered", type="date", nullable=true)
     * @Groups({"elected_official"})
     */
    private $dateConsidered;

    /**
     * @var string
     *
     * @ORM\Column(name="name", type="string", length=255, nullable=true)
     * @Groups({"elected_official"})
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column(name="summary", type="text", nullable=true)
     * @Groups({"elected_official"})
     */
    private $summary;

    /**
     * @var string
     *
     * @ORM\Column(name="evaluator_approved_position", type="string", length=255, nullable=true)
     * @Groups({"elected_official"})
     */
    private $evaluatorApprovedPosition;

    /**
     * @var integer
     *
     * @ORM\Column(name="weighting", type="integer", nullable=true)
     * @Groups({"elected_official"})
     */
    private $weighting;

    /**
     * @var string
     *
     * @ORM\Column(name="notes", type="text", nullable=true)
     * @Groups({"elected_official"})
     */
    private $notes;

    /**
     * @ORM\OneToMany(targetEntity="ElectedOfficialVote", mappedBy="legislation")
     * @Exclude
     */
    private $electedOfficialVotes;

    /**
     * @ORM\ManyToOne(targetEntity="IssueCategory", inversedBy="legislations")
     * @Groups({"elected_official"})
     */
    private $issueCategory;

    /**
     * @ORM\ManyToOne(targetEntity="Government", inversedBy="legislations")
     * @Exclude
     */
    private $government;

    /**
     * @return string
     */
    public function __toString()
    {
        return $this->name;
    }

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->electedOfficialVotes = new \Doctrine\Common\Collections\ArrayCollection();
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
     * Set govAssignedNumber
     *
     * @param string $govAssignedNumber
     * @return Legislation
     */
    public function setGovAssignedNumber($govAssignedNumber)
    {
        $this->govAssignedNumber = $govAssignedNumber;

        return $this;
    }

    /**
     * Get govAssignedNumber
     *
     * @return string
     */
    public function getGovAssignedNumber()
    {
        return $this->govAssignedNumber;
    }

    /**
     * Set dateConsidered
     *
     * @param \DateTime $dateConsidered
     * @return Legislation
     */
    public function setDateConsidered($dateConsidered)
    {
        $this->dateConsidered = $dateConsidered;

        return $this;
    }

    /**
     * Get dateConsidered
     *
     * @return \DateTime
     */
    public function getDateConsidered()
    {
        return $this->dateConsidered;
    }

    /**
     * Set name
     *
     * @param string $name
     * @return Legislation
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
     * Set summary
     *
     * @param string $summary
     * @return Legislation
     */
    public function setSummary($summary)
    {
        $this->summary = $summary;

        return $this;
    }

    /**
     * Get summary
     *
     * @return string
     */
    public function getSummary()
    {
        return $this->summary;
    }

    /**
     * Set evaluatorApprovedPosition
     *
     * @param string $evaluatorApprovedPosition
     * @return Legislation
     */
    public function setEvaluatorApprovedPosition($evaluatorApprovedPosition)
    {
        $this->evaluatorApprovedPosition = $evaluatorApprovedPosition;

        return $this;
    }

    /**
     * Get evaluatorApprovedPosition
     *
     * @return string
     */
    public function getEvaluatorApprovedPosition()
    {
        return $this->evaluatorApprovedPosition;
    }

    /**
     * Set weighting
     *
     * @param integer $weighting
     * @return Legislation
     */
    public function setWeighting($weighting)
    {
        $this->weighting = $weighting;

        return $this;
    }

    /**
     * Get weighting
     *
     * @return integer
     */
    public function getWeighting()
    {
        return $this->weighting;
    }

    /**
     * Set notes
     *
     * @param string $notes
     * @return Legislation
     */
    public function setNotes($notes)
    {
        $this->notes = $notes;

        return $this;
    }

    /**
     * Get notes
     *
     * @return string
     */
    public function getNotes()
    {
        return $this->notes;
    }

    /**
     * Add electedOfficialVotes
     *
     * @param \GovWiki\DbBundle\Entity\ElectedOfficialVote $electedOfficialVotes
     * @return Legislation
     */
    public function addElectedOfficialVote(\GovWiki\DbBundle\Entity\ElectedOfficialVote $electedOfficialVotes)
    {
        $this->electedOfficialVotes[] = $electedOfficialVotes;
        $electedOfficialVotes->setLegislation($this);

        return $this;
    }

    /**
     * Remove electedOfficialVotes
     *
     * @param \GovWiki\DbBundle\Entity\ElectedOfficialVote $electedOfficialVotes
     */
    public function removeElectedOfficialVote(\GovWiki\DbBundle\Entity\ElectedOfficialVote $electedOfficialVotes)
    {
        $this->electedOfficialVotes->removeElement($electedOfficialVotes);
    }

    /**
     * Get electedOfficialVotes
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getElectedOfficialVotes()
    {
        return $this->electedOfficialVotes;
    }

    /**
     * Set issueCategory
     *
     * @param \GovWiki\DbBundle\Entity\IssueCategory $issueCategory
     * @return Legislation
     */
    public function setIssueCategory(\GovWiki\DbBundle\Entity\IssueCategory $issueCategory = null)
    {
        $this->issueCategory = $issueCategory;

        return $this;
    }

    /**
     * Get issueCategory
     *
     * @return \GovWiki\DbBundle\Entity\IssueCategory
     */
    public function getIssueCategory()
    {
        return $this->issueCategory;
    }

    /**
     * Set government
     *
     * @param \GovWiki\DbBundle\Entity\Government $government
     * @return Legislation
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
}
