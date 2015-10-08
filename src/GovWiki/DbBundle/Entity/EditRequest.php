<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation\Timestampable;

/**
 * EditRequest
 *
 * @ORM\Table(name="edit_requests")
 * @ORM\Entity
 */
class EditRequest
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
     * @ORM\Column(name="entity_name", type="string", length=255)
     */
    private $entityName;

    /**
     * @var integer
     *
     * @ORM\Column(name="entity_id", type="integer")
     */
    private $entityId;

    /**
     * @var string
     *
     * @ORM\Column(name="changes", type="array")
     */
    private $changes;

    /**
     * @var string
     *
     * @ORM\Column(name="comment", type="text", nullable=true)
     */
    private $comment;

    /**
     * @var string
     *
     * @ORM\Column(name="status", type="string", length=255)
     */
    private $status = 'pending';

    /**
     * @var array
     */
    public $statusChoices = ['pending', 'applied', 'discarded'];

    /**
     * @var \DateTime $created
     *
     * @Timestampable(on="create")
     * @ORM\Column(type="datetime")
     */
    private $created;

    /**
     * @ORM\ManyToOne(targetEntity="GovWiki\UserBundle\Entity\User", inversedBy="editRequests")
     */
    private $user;

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
     * Set entityName
     *
     * @param string $entityName
     * @return EditRequest
     */
    public function setEntityName($entityName)
    {
        $this->entityName = $entityName;

        return $this;
    }

    /**
     * Get entityName
     *
     * @return string
     */
    public function getEntityName()
    {
        return $this->entityName;
    }

    /**
     * Set entityId
     *
     * @param integer $entityId
     * @return EditRequest
     */
    public function setEntityId($entityId)
    {
        $this->entityId = $entityId;

        return $this;
    }

    /**
     * Get entityId
     *
     * @return integer
     */
    public function getEntityId()
    {
        return $this->entityId;
    }

    /**
     * Set changes
     *
     * @param array $changes
     * @return EditRequest
     */
    public function setChanges($changes)
    {
        $this->changes = $changes;

        return $this;
    }

    /**
     * Get changes
     *
     * @return array
     */
    public function getChanges()
    {
        return $this->changes;
    }

    /**
     * Set comment
     *
     * @param string $comment
     * @return EditRequest
     */
    public function setComment($comment)
    {
        $this->comment = $comment;

        return $this;
    }

    /**
     * Get comment
     *
     * @return string
     */
    public function getComment()
    {
        return $this->comment;
    }

    /**
     * Set status
     *
     * @param string $status
     * @return EditRequest
     */
    public function setStatus($status)
    {
        $this->status = $status;

        return $this;
    }

    /**
     * Get status
     *
     * @return string
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * Set created
     *
     * @param \DateTime $created
     * @return EditRequest
     */
    public function setCreated($created)
    {
        $this->created = $created;

        return $this;
    }

    /**
     * Get created
     *
     * @return \DateTime
     */
    public function getCreated()
    {
        return $this->created;
    }

    /**
     * Set user
     *
     * @param \GovWiki\UserBundle\Entity\User $user
     * @return EditRequest
     */
    public function setUser(\GovWiki\UserBundle\Entity\User $user = null)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \GovWiki\UserBundle\Entity\User
     */
    public function getUser()
    {
        return $this->user;
    }
}
