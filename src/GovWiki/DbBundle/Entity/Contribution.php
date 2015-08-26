<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Contribution
 *
 * @ORM\Table(name="contributions")
 * @ORM\Entity
 */
class Contribution
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
     * @var integer
     *
     * @ORM\Column(name="election_year", type="integer", nullable=true)
     */
    private $electionYear;

    /**
     * @var string
     *
     * @ORM\Column(name="contributor_name", type="string", length=255, nullable=true)
     */
    private $contributorName;

    /**
     * @var string
     *
     * @ORM\Column(name="independent_expenditure_desc", type="string", length=255, nullable=true)
     */
    private $independentExpenditureDesc;

    /**
     * @var float
     *
     * @ORM\Column(name="contribution_amount", type="float", nullable=true)
     */
    private $contributionAmount;

    /**
     * @var string
     *
     * @ORM\Column(name="contributor_type", type="string", length=255, nullable=true)
     */
    private $contributorType;

    /**
     * @ORM\ManyToOne(targetEntity="ElectedOfficial", inversedBy="contributions")
     */
    private $electedOfficial;

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
     * Set electionYear
     *
     * @param integer $electionYear
     * @return Contribution
     */
    public function setElectionYear($electionYear)
    {
        $this->electionYear = $electionYear;

        return $this;
    }

    /**
     * Get electionYear
     *
     * @return integer
     */
    public function getElectionYear()
    {
        return $this->electionYear;
    }

    /**
     * Set contributorName
     *
     * @param string $contributorName
     * @return Contribution
     */
    public function setContributorName($contributorName)
    {
        $this->contributorName = $contributorName;

        return $this;
    }

    /**
     * Get contributorName
     *
     * @return string
     */
    public function getContributorName()
    {
        return $this->contributorName;
    }

    /**
     * Set independentExpenditureDesc
     *
     * @param string $independentExpenditureDesc
     * @return Contribution
     */
    public function setIndependentExpenditureDesc($independentExpenditureDesc)
    {
        $this->independentExpenditureDesc = $independentExpenditureDesc;

        return $this;
    }

    /**
     * Get independentExpenditureDesc
     *
     * @return string
     */
    public function getIndependentExpenditureDesc()
    {
        return $this->independentExpenditureDesc;
    }

    /**
     * Set contributionAmount
     *
     * @param float $contributionAmount
     * @return Contribution
     */
    public function setContributionAmount($contributionAmount)
    {
        $this->contributionAmount = $contributionAmount;

        return $this;
    }

    /**
     * Get contributionAmount
     *
     * @return float
     */
    public function getContributionAmount()
    {
        return $this->contributionAmount;
    }

    /**
     * Set contributorType
     *
     * @param string $contributorType
     * @return Contribution
     */
    public function setContributorType($contributorType)
    {
        $this->contributorType = $contributorType;

        return $this;
    }

    /**
     * Get contributorType
     *
     * @return string
     */
    public function getContributorType()
    {
        return $this->contributorType;
    }

    /**
     * Set electedOfficial
     *
     * @param \GovWiki\DbBundle\Entity\ElectedOfficial $electedOfficial
     * @return Contribution
     */
    public function setElectedOfficial(\GovWiki\DbBundle\Entity\ElectedOfficial $electedOfficial = null)
    {
        $this->electedOfficial = $electedOfficial;

        return $this;
    }

    /**
     * Get electedOfficial
     *
     * @return \GovWiki\DbBundle\Entity\ElectedOfficial
     */
    public function getElectedOfficial()
    {
        return $this->electedOfficial;
    }
}
