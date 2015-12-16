<?php

namespace GovWiki\UserBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use FOS\UserBundle\Model\User as BaseUser;
use Doctrine\ORM\Mapping as ORM;
use GovWiki\DbBundle\Entity\CreateRequest;
use GovWiki\DbBundle\Entity\EditRequest;
use GovWiki\DbBundle\Entity\Environment;
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
     * @var Collection
     *
     * @ORM\OneToMany(
     *  targetEntity="GovWiki\DbBundle\Entity\CreateRequest",
     *  mappedBy="user"
     * )
     */
    private $createRequests;

    /**
     * @var Collection
     *
     * @ORM\OneToMany(
     *  targetEntity="GovWiki\DbBundle\Entity\EditRequest",
     *  mappedBy="user"
     * )
     */
    private $editRequests;

    /**
     * @var Collection
     *
     * @ORM\ManyToMany(
     *  targetEntity="GovWiki\DbBundle\Entity\Environment",
     *  inversedBy="users"
     * )
     * @ORM\JoinTable(name="cross_users_environments")
     */
    private $environments;

    /**
     * Constructor
     */
    public function __construct()
    {
        parent::__construct();

        $this->createRequests = new ArrayCollection();
        $this->editRequests   = new ArrayCollection();
    }

    /**
     * Add createRequests
     *
     * @param CreateRequest $createRequests A CreateRequest instance.
     *
     * @return User
     */
    public function addCreateRequest(CreateRequest $createRequests)
    {
        $this->createRequests[] = $createRequests;

        return $this;
    }

    /**
     * Remove createRequests
     *
     * @param CreateRequest $createRequests A CreateRequest instance.
     *
     * @return User
     */
    public function removeCreateRequest(CreateRequest $createRequests)
    {
        $this->createRequests->removeElement($createRequests);

        return $this;
    }

    /**
     * Get createRequests
     *
     * @return Collection
     */
    public function getCreateRequests()
    {
        return $this->createRequests;
    }

    /**
     * Add editRequests
     *
     * @param EditRequest $editRequests A EditRequest instance.
     *
     * @return User
     */
    public function addEditRequest(EditRequest $editRequests)
    {
        $this->editRequests[] = $editRequests;

        return $this;
    }

    /**
     * Remove editRequests
     *
     * @param EditRequest $editRequests A EditRequest instance.
     *
     * @return User
     */
    public function removeEditRequest(EditRequest $editRequests)
    {
        $this->editRequests->removeElement($editRequests);

        return $this;
    }

    /**
     * Get editRequests
     *
     * @return Collection
     */
    public function getEditRequests()
    {
        return $this->editRequests;
    }

    /**
     * Add environment
     *
     * @param Environment $environment A Environment instance.
     *
     * @return User
     */
    public function addEnvironment(Environment $environment)
    {
        $this->environments[] = $environment;

        return $this;
    }

    /**
     * Remove environment
     *
     * @param Environment $environment A Environment instance.
     *
     * @return User
     */
    public function removeEnvironment(Environment $environment)
    {
        $this->environments->removeElement($environment);

        return $this;
    }

    /**
     * Get environment
     *
     * @return Collection
     */
    public function getEnvironments()
    {
        return $this->environments;
    }
}
