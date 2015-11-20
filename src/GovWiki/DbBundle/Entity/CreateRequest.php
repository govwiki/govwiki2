<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation\Timestampable;
use JMS\Serializer\Annotation\Groups;

/**
 * CreateRequest
 *
 * @ORM\Table(name="create_requests")
 * @ORM\Entity(repositoryClass="GovWiki\DbBundle\Entity\Repository\CreateRequestRepository")
 */
class CreateRequest
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
     * @Groups({"elected_official"})
     */
    private $entityName;

    /**
     * @var array
     *
     * @ORM\Column(name="fields", type="array")
     * @Groups({"elected_official"})
     */
    private $fields;

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
     * @Groups({"elected_official"})
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
     * @ORM\ManyToOne(targetEntity="GovWiki\UserBundle\Entity\User", inversedBy="createRequests")
     * @Groups({"elected_official"})
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
     * @return CreateRequest
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
     * Set fields
     *
     * @param array $fields
     * @return CreateRequest
     */
    public function setFields($fields)
    {
        $this->fields = $fields;

        return $this;
    }

    /**
     * Get fields
     *
     * @return array
     */
    public function getFields()
    {
        return $this->fields;
    }

    /**
     * Set comment
     *
     * @param string $comment
     * @return CreateRequest
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
     * @return CreateRequest
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
     * @return CreateRequest
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
     * @return CreateRequest
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
