<?php

namespace GovWiki\UserBundle\Entity;

use FOS\UserBundle\Model\User as BaseUser;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="users")
 */
class User extends BaseUser
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    /**
     * @ORM\OneToMany(targetEntity="GovWiki\DbBundle\Entity\EditRequest", mappedBy="user")
     */
    private $editRequests;

    /**
     * Constructor
     */
    public function __construct()
    {
        parent::__construct();

        $this->editRequests = new \Doctrine\Common\Collections\ArrayCollection();
    }

    /**
     * Add editRequests
     *
     * @param \GovWiki\DbBundle\Entity\EditRequest $editRequests
     * @return User
     */
    public function addEditRequest(\GovWiki\DbBundle\Entity\EditRequest $editRequests)
    {
        $this->editRequests[] = $editRequests;

        return $this;
    }

    /**
     * Remove editRequests
     *
     * @param \GovWiki\DbBundle\Entity\EditRequest $editRequests
     */
    public function removeEditRequest(\GovWiki\DbBundle\Entity\EditRequest $editRequests)
    {
        $this->editRequests->removeElement($editRequests);
    }

    /**
     * Get editRequests
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getEditRequests()
    {
        return $this->editRequests;
    }
}
