<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use GovWiki\UserBundle\Entity\User;

/**
 * @ORM\MappedSuperclass()
 */
abstract class AbstractCreatable
{

    const STATE_PENDING = 'pending';
    const STATE_APPLIED = 'applied';
    const STATE_DISCARDED = 'discarded';

    /**
     * @var \DateTime
     *
     * @ORM\Column(type="datetime")
     */
    protected $createAt;

    /**
     * @var User
     *
     * @ORM\ManyToOne(targetEntity="GovWiki\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="creator_id")
     */
    protected $creator;

    /**
     * @var string
     *
     * @ORM\Column(nullable=true)
     */
    protected $state;

    /**
     *
     */
    public function __construct()
    {
        $this->createAt = new \DateTime();
    }

    /**
     * @return \DateTime
     */
    public function getCreateAt()
    {
        return $this->createAt;
    }

    /**
     * @param \DateTime $createAt A DateTime instance.
     *
     * @return AbstractCreatable
     */
    public function setCreateAt($createAt)
    {
        $this->createAt = $createAt;

        return $this;
    }

    /**
     * @return User
     */
    public function getCreator()
    {
        return $this->creator;
    }

    /**
     * @param User $creator A User instance.
     *
     * @return AbstractCreatable
     */
    public function setCreator($creator)
    {
        $this->creator = $creator;

        return $this;
    }

    /**
     * @return string
     */
    public function getState()
    {
        return $this->state;
    }

    /**
     * @param string $state
     *
     * @return AbstractCreatable
     */
    public function setState($state)
    {
        $this->state = $state;

        return $this;
    }
}
