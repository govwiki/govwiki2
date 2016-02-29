<?php

namespace GovWiki\CommentBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use GovWiki\DbBundle\Entity\AbstractKey;
use GovWiki\DbBundle\Entity\ElectedOfficialVote;
use JMS\Serializer\Annotation\Groups;

/**
 * Generate for each pair of elected official and his/her vote in order to
 * provide ability to make link to elected comment form.
 *
 * @ORM\Entity(
 *  repositoryClass="GovWiki\CommentBundle\Entity\Repository\CommentKeyRepository"
 * )
 */
class CommentKey extends AbstractKey
{
    /**
     * @var ElectedOfficialVote
     *
     * @ORM\OneToOne(targetEntity="GovWiki\DbBundle\Entity\ElectedOfficialVote")
     * @ORM\JoinColumn("vote_id")
     */
    private $vote;

    /**
     * @return ElectedOfficialVote
     */
    public function getVote()
    {
        return $this->vote;
    }

    /**
     * @param ElectedOfficialVote $vote A ElectedOfficialVote instance.
     *
     * @return CommentKey
     */
    public function setVote(ElectedOfficialVote $vote)
    {
        $this->vote = $vote;

        return $this;
    }
}
