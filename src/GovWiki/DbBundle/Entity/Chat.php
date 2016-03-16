<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Chat
 *
 * @ORM\Table(name="chats")
 * @ORM\Entity
 */
class Chat
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
     * @ORM\OneToOne(targetEntity="Government")
     * @ORM\JoinColumn(name="government_id", referencedColumnName="id")
     */
    private $government;

    /**
     * @var Collection
     *
     * @ORM\OneToMany(
     *  targetEntity="Message",
     *  mappedBy="chat"
     * )
     */
    private $messages;

    /**
     * @var Collection
     *
     * @ORM\ManyToMany(
     *  targetEntity="GovWiki\UserBundle\Entity\User",
     *  inversedBy="chats"
     * )
     * @ORM\JoinTable(name="cross_chats_members")
     */
    private $members;


    /**
     * Constructor
     */
    public function __construct()
    {
        $this->messages = new ArrayCollection();
        $this->members  = new ArrayCollection();
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
     * Add messages
     *
     * @param \GovWiki\DbBundle\Entity\Message $messages
     * @return Chat
     */
    public function addMessage(\GovWiki\DbBundle\Entity\Message $messages)
    {
        $this->messages[] = $messages;

        return $this;
    }

    /**
     * Remove messages
     *
     * @param \GovWiki\DbBundle\Entity\Message $messages
     */
    public function removeMessage(\GovWiki\DbBundle\Entity\Message $messages)
    {
        $this->messages->removeElement($messages);
    }

    /**
     * Get messages
     *
     * @return \Doctrine\Common\Collections\Collection 
     */
    public function getMessages()
    {
        return $this->messages;
    }

    /**
     * Add members
     *
     * @param \GovWiki\UserBundle\Entity\User $members
     * @return Chat
     */
    public function addMember(\GovWiki\UserBundle\Entity\User $members)
    {
        $this->members[] = $members;

        return $this;
    }

    /**
     * Remove members
     *
     * @param \GovWiki\UserBundle\Entity\User $members
     */
    public function removeMember(\GovWiki\UserBundle\Entity\User $members)
    {
        $this->members->removeElement($members);
    }

    /**
     * Get members
     *
     * @return \Doctrine\Common\Collections\Collection 
     */
    public function getMembers()
    {
        return $this->members;
    }

    /**
     * Set government
     *
     * @param \GovWiki\DbBundle\Entity\Government $government
     * @return Chat
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
