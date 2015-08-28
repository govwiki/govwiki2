<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Legislation
 *
 * @ORM\Table(name="legislations")
 * @ORM\Entity
 */
class Legislation
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
     * @ORM\Column(name="gov_assigned_number", type="string", length=255, nullable=true)
     */
    private $govAssignedNumber;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="date_considered", type="date", nullable=true)
     */
    private $dateConsidered;

    /**
     * @var string
     *
     * @ORM\Column(name="name", type="string", length=255, nullable=true)
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column(name="summary", type="string", length=255, nullable=true)
     */
    private $summary;

    /**
     * @var string
     *
     * @ORM\Column(name="evaluator_approved_position", type="string", length=255, nullable=true)
     */
    private $evaluatorApprovedPosition;

    /**
     * @var integer
     *
     * @ORM\Column(name="weighting", type="integer", nullable=true)
     */
    private $weighting;

    /**
     * @var string
     *
     * @ORM\Column(name="notes", type="text", nullable=true)
     */
    private $notes;

    /**
     * @ORM\OneToMany(targetEntity="ElectedOfficialVote", mappedBy="legislation")
     */
    private $electedOfficialVotes;

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
}
