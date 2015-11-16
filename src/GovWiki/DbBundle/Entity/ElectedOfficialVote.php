<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation\Groups;

/**
 * ElectedOfficialVote
 *
 * @ORM\Table(name="elected_officials_votes")
 * @ORM\Entity
 */
class ElectedOfficialVote
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
     * @ORM\Column(name="vote", type="string", length=255, nullable=true)
     * @Groups({"elected_official"})
     */
    private $vote;

    /**
     * @var boolean
     *
     * @ORM\Column(name="did_elected_official_propose_this", type="boolean", nullable=true)
     * @Groups({"elected_official"})
     */
    private $didElectedOfficialProposeThis;

    /**
     * @ORM\ManyToOne(targetEntity="ElectedOfficial", inversedBy="votes")
     */
    private $electedOfficial;

    /**
     * @ORM\ManyToOne(targetEntity="Legislation", inversedBy="electedOfficialVotes")
     * @Groups({"elected_official"})
     */
    private $legislation;

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
     * Set vote
     *
     * @param string $vote
     * @return ElectedOfficialVote
     */
    public function setVote($vote)
    {
        $this->vote = $vote;

        return $this;
    }

    /**
     * Get vote
     *
     * @return string
     */
    public function getVote()
    {
        return $this->vote;
    }

    /**
     * Set didElectedOfficialProposeThis
     *
     * @param boolean $didElectedOfficialProposeThis
     * @return ElectedOfficialVote
     */
    public function setDidElectedOfficialProposeThis($didElectedOfficialProposeThis)
    {
        $this->didElectedOfficialProposeThis = $didElectedOfficialProposeThis;

        return $this;
    }

    /**
     * Get didElectedOfficialProposeThis
     *
     * @return boolean
     */
    public function getDidElectedOfficialProposeThis()
    {
        return $this->didElectedOfficialProposeThis;
    }

    /**
     * Set electedOfficial
     *
     * @param \GovWiki\DbBundle\Entity\ElectedOfficial $electedOfficial
     * @return ElectedOfficialVote
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

    /**
     * Set legislation
     *
     * @param \GovWiki\DbBundle\Entity\Legislation $legislation
     * @return ElectedOfficialVote
     */
    public function setLegislation(\GovWiki\DbBundle\Entity\Legislation $legislation = null)
    {
        $this->legislation = $legislation;

        return $this;
    }

    /**
     * Get legislation
     *
     * @return \GovWiki\DbBundle\Entity\Legislation
     */
    public function getLegislation()
    {
        return $this->legislation;
    }
}
