<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use GovWiki\CommentBundle\Entity\VoteComment;
use GovWiki\DbBundle\Form\ElectedOfficialVoteType;
use GovWiki\RequestBundle\Entity\LegislationCreateRequest;
use JMS\Serializer\Annotation\Groups;

/**
 * ElectedOfficialVote
 *
 * @ORM\Table(name="elected_officials_votes")
 * @ORM\Entity(
 *  repositoryClass="GovWiki\DbBundle\Entity\Repository\ElectedOfficialVoteRepository"
 * )
 */
class ElectedOfficialVote implements StaffEntityInterface
{

    const YES = 'Yes';
    const NO = 'No';
    const ABSTAIN = 'Abstain';
    const ABSENCE = 'Absence';
    const NOT_IN_OFFICE = 'Not in office';

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
     * @var Legislation
     *
     * @ORM\ManyToOne(targetEntity="Legislation", inversedBy="electedOfficialVotes")
     * @Groups({"elected_official"})
     */
    private $legislation;

    /**
     * @var Collection
     *
     * @ORM\OneToMany(
     *  targetEntity="GovWiki\CommentBundle\Entity\VoteComment",
     *  mappedBy="subject",
     *  cascade={"persist", "remove"}
     * )
     */
    private $comments;

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
     *
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
     * @return array
     */
    public static function getAvailable()
    {
        return [
            self::YES => self::YES,
            self::NO => self::NO,
            self::ABSTAIN => self::ABSTAIN,
            self::ABSENCE => self::ABSENCE,
            self::NOT_IN_OFFICE => self::NOT_IN_OFFICE,
        ];
    }

    /**
     * Set didElectedOfficialProposeThis
     *
     * @param boolean $didElectedOfficialProposeThis
     *
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
     * @param ElectedOfficial $electedOfficial A ElectedOfficial entity instance.
     *
     * @return ElectedOfficialVote
     */
    public function setElectedOfficial(ElectedOfficial $electedOfficial = null)
    {
        $this->electedOfficial = $electedOfficial;

        return $this;
    }

    /**
     * Get electedOfficial
     *
     * @return ElectedOfficial
     */
    public function getElectedOfficial()
    {
        return $this->electedOfficial;
    }

    /**
     * Set legislation
     *
     * @param Legislation $legislation A Legislation entity instance.
     *
     * @return ElectedOfficialVote
     */
    public function setLegislation(Legislation $legislation = null)
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

    /**
     * Add comment
     *
     * @param VoteComment $comment A VoteComment entity instance.
     *
     * @return Legislation
     */
    public function addComment(VoteComment $comment)
    {
        $this->comments[] = $comment;
        $comment->setSubject($this);

        return $this;
    }

    /**
     * Remove comment
     *
     * @param VoteComment $comment A VoteComment entity instance.
     *
     * @return ElectedOfficialVote
     */
    public function removeComment(VoteComment $comment)
    {
        $this->comments->removeElement($comment);

        return $this;
    }

    /**
     * Get comment
     *
     * @return Collection
     */
    public function getComments()
    {
        return $this->comments;
    }

    /**
     * {@inheritdoc}
     */
    public static function getFormType()
    {
        return new ElectedOfficialVoteType();
    }

    /**
     * @return \GovWiki\RequestBundle\Entity\LegislationCreateRequest
     */
    public function getRequest()
    {
        return $this->legislation->getRequest();
    }
}
