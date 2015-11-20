<?php

namespace GovWiki\UserBundle\Entity;

use FOS\UserBundle\Model\User as BaseUser;
use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation\Groups;

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
     * @var string
     * @Groups({"elected_official"})
     */
    protected $username;

    /**
     * @ORM\OneToMany(targetEntity="GovWiki\DbBundle\Entity\CreateRequest", mappedBy="user")
     */
    private $createRequests;

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

        $this->createRequests = new \Doctrine\Common\Collections\ArrayCollection();
        $this->editRequests   = new \Doctrine\Common\Collections\ArrayCollection();
    }

    /**
     * Add createRequests
     *
     * @param \GovWiki\DbBundle\Entity\CreateRequest $createRequests
     * @return User
     */
    public function addCreateRequest(\GovWiki\DbBundle\Entity\CreateRequest $createRequests)
    {
        $this->createRequests[] = $createRequests;

        return $this;
    }

    /**
     * Remove createRequests
     *
     * @param \GovWiki\DbBundle\Entity\CreateRequest $createRequests
     */
    public function removeCreateRequest(\GovWiki\DbBundle\Entity\CreateRequest $createRequests)
    {
        $this->createRequests->removeElement($createRequests);
    }

    /**
     * Get createRequests
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getCreateRequests()
    {
        return $this->createRequests;
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
