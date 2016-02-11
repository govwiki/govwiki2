<?php

namespace GovWiki\CommentBundle\Service;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\CommentBundle\Entity\CommentKey;
use GovWiki\DbBundle\Entity\ElectedOfficialVote;
use GovWiki\DbBundle\Exception\UnknownKeyException;

/**
 * Class CommentKeyManager
 * @package GovWiki\UserBundle\Service
 */
class CommentKeyManager
{

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @param EntityManagerInterface $em A EntityManagerInterface instance.
     */
    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    /**
     * @param ElectedOfficialVote $vote A ElectedOfficialVote instance.
     *
     * @return CommentKey
     */
    public function create(ElectedOfficialVote $vote)
    {
        $key = new CommentKey();
        $key
            ->setVote($vote)
            ->setKey(md5(
                $vote->getElectedOfficial()->getId() .'_v'.
                $vote->getId()
            ));

        return $key;
    }

    /**
     * @param string $key Generated key.
     *
     * @return ElectedOfficialVote|null
     *
     * @throws UnknownKeyException Can't find given key.
     */
    public function getVote($key)
    {
        $commentKey = $this->em->getRepository('GovWikiCommentBundle:CommentKey')
            ->findKey($key);

        if (null === $commentKey) {
            throw new UnknownKeyException($key);
        }

        return $commentKey->getVote();
    }
}
