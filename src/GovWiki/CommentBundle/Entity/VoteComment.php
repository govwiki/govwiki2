<?php

namespace GovWiki\CommentBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\ElectedOfficialVote;

/**
 * @ORM\Entity()
 */
class VoteComment extends AbstractComment
{
    /**
     * @var ElectedOfficial
     *
     * @ORM\ManyToOne(targetEntity="GovWiki\DbBundle\Entity\ElectedOfficial")
     * @ORM\JoinColumn("elected_id")
     */
    private $elected;

    /**
     * @var ElectedOfficialVote
     *
     * @ORM\ManyToOne(
     *  targetEntity="GovWiki\DbBundle\Entity\ElectedOfficialVote",
     *  inversedBy="comments"
     * )
     * @ORM\JoinColumn("subject_id")
     */
    protected $subject;

    /**
     * @return ElectedOfficialVote
     */
    public function getSubject()
    {
        return $this->subject;
    }

    /**
     * @param ElectedOfficialVote $subject A ElectedOfficialVote instance.
     *
     * @return VoteComment
     */
    public function setSubject(ElectedOfficialVote $subject)
    {
        $this->subject = $subject;

        return $this;
    }

    /**
     * @return ElectedOfficial
     */
    public function getElected()
    {
        return $this->elected;
    }

    /**
     * @param ElectedOfficial $elected A ElectedOfficial instance.
     *
     * @return VoteComment
     */
    public function setElected(ElectedOfficial $elected)
    {
        $this->elected = $elected;

        return $this;
    }
}
