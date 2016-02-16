<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\QueryBuilder;
use GovWiki\RequestBundle\Entity\AbstractCreatable;
use GovWiki\RequestBundle\Entity\ContributionCreateRequest;
use JMS\Serializer\Annotation\Groups;

/**
 * Contribution
 *
 * @ORM\Table(name="contributions")
 * @ORM\Entity(
 *  repositoryClass="GovWiki\DbBundle\Entity\Repository\ContributionRepository"
 * )
 */
class Contribution extends AbstractCreatable
{
    const CANDIDATE_COMMITEE = 'Candidate Committee';
    const CORPORATE = 'Corporate';
    const INDIVIDUAL = 'Individual';
    const POLITICAL_PARTY = 'Political Party';
    const POLITICAL_ACTION_COMMITTEE = 'Political Action Committee';
    const SELF = 'Self';
    const UNION = 'Union';
    const OTHER = 'Other';

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
     * @var integer
     *
     * @ORM\Column(name="election_year", type="integer", nullable=true)
     * @Groups({"elected_official"})
     */
    private $electionYear;

    /**
     * @var string
     *
     * @ORM\Column(name="contributor_name", type="string", length=255, nullable=true)
     * @Groups({"elected_official"})
     */
    private $contributorName;

    /**
     * @var string
     *
     * @ORM\Column(name="independent_expenditure_desc", type="string", length=255, nullable=true)
     * @Groups({"elected_official"})
     */
    private $independentExpenditureDesc;

    /**
     * @var float
     *
     * @ORM\Column(name="contribution_amount", type="float", nullable=true)
     * @Groups({"elected_official"})
     */
    private $contributionAmount;

    /**
     * @var string
     *
     * @ORM\Column(name="contributor_type", type="string", length=255, nullable=true)
     * @Groups({"elected_official"})
     */
    private $contributorType;

    /**
     * @ORM\ManyToOne(targetEntity="ElectedOfficial", inversedBy="contributions")
     */
    private $electedOfficial;

    /**
     * @var ContributionCreateRequest
     *
     * @ORM\OneToOne(
     *  targetEntity="GovWiki\RequestBundle\Entity\ContributionCreateRequest",
     *  inversedBy="subject",
     *  cascade={ "persist", "remove" }
     * )
     * @ORM\JoinColumn(name="request_id")
     */
    protected $request;

    /**
     * @return array
     */
    public static function getAvailableContributorType()
    {
       return [
           self::CANDIDATE_COMMITEE => self::CANDIDATE_COMMITEE,
           self::CORPORATE => self::CORPORATE,
           self::INDIVIDUAL => self::INDIVIDUAL,
           self::POLITICAL_PARTY => self::POLITICAL_PARTY,
           self::POLITICAL_ACTION_COMMITTEE => self::POLITICAL_ACTION_COMMITTEE,
           self::SELF => self::SELF,
           self::UNION => self::UNION,
           self::OTHER => self::OTHER,
       ];
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
