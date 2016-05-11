<?php

namespace GovWiki\UserBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use FOS\UserBundle\Model\User as BaseUser;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use GovWiki\DbBundle\Entity\CreateRequest;
use GovWiki\DbBundle\Entity\EditRequest;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Government;
use JMS\Serializer\Annotation\Groups;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Validator\Constraints\Email;

/**
 * @ORM\Entity(
 *  repositoryClass="GovWiki\UserBundle\Entity\Repository\UserRepository"
 * )
 * @ORM\Table(name="users")
 * @UniqueEntity(fields="username")
 * @UniqueEntity(fields="email")
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
     * @var string
     * @Email()
     */
    protected $email;
//
//    /**
//     * @var Collection
//     *
//     * @ORM\OneToMany(
//     *  targetEntity="GovWiki\RequestBundle\Entity\AbstractCreateRequest",
//     *  mappedBy="user"
//     * )
//     */
//    private $createRequests;

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
     * @var Collection
     *
     * @ORM\ManyToMany(
     *  targetEntity="GovWiki\DbBundle\Entity\Government",
     *  mappedBy="subscribers"
     * )
     */
    private $subscribedTo;

    /**
     * @var string
     * @ORM\Column(type="string", nullable=true, unique=true)
     * @Assert\Regex(pattern="/^(\+?[0-9]{11}|)$/", message="Please, enter valid phone, example: 4158675309")
     */
    protected $phone;

    /**
     * @var string
     * @ORM\Column(name="phone_confirmed", type="boolean")
     */
    protected $phoneConfirmed = false;

    /**
     * @var string
     * @ORM\Column(name="phone_confirmed_key", type="string", nullable=true)
     */
    protected $phoneConfirmedKey;

    /**
     * @var Collection
     *
     * @ORM\OneToMany(
     *  targetEntity="GovWiki\DbBundle\Entity\Message",
     *  mappedBy="author"
     * )
     */
    private $messages;

    /**
     * @var Collection
     *
     * @ORM\ManyToMany(
     *  targetEntity="GovWiki\DbBundle\Entity\Chat",
     *  mappedBy="members"
     * )
     */
    private $chats;


    /**
     * Constructor
     */
    public function __construct()
    {
        parent::__construct();

        $this->createRequests = new ArrayCollection();
        $this->editRequests   = new ArrayCollection();
        $this->messages       = new ArrayCollection();
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
     * Add environment
     *
     * @param Environment $environment A Environment instance or null.
     *
     * @return User
     */
    public function setEnvironments(Environment $environment = null)
    {
        if ($this->environments !== null) {
            $this->environments->clear();

            return $this;
        }

        return $this->addEnvironment($environment);
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

    /**
     * @param Government $government A User instance.
     *
     * @return User
     */
    public function addSubscribedTo(Government $government)
    {
        $this->subscribedTo[] = $government;
        $government->addSubscriber($this);

        return $this;
    }

    /**
     * @param Government $government A User instance.
     *
     * @return User
     */
    public function removeSubscribedTo(Government $government)
    {
        $this->subscribedTo->remove($government);

        return $this;
    }

    /**
     * Need for registration form.
     *
     * @param Government $government A Government entity instance.
     *
     * @return User
     */
    public function setSubscribedTo(Government $government)
    {
        return $this->addSubscribedTo($government);
    }

    /**
     * @return Collection
     */
    public function getSubscribedTo()
    {
        return $this->subscribedTo;
    }

    /**
     * @param string $phone
     *
     * @return User
     */
    public function setPhone($phone)
    {
        $this->phone = '+1'. $phone;

        return $this;
    }

    /**
     * @return $this
     */
    public function getPhone()
    {
        return $this->phone;
    }

    /**
     * @param boolean $phoneConfirmed
     *
     * @return User
     */
    public function setPhoneConfirmed($phoneConfirmed)
    {
        $this->phoneConfirmed = $phoneConfirmed;

        return $this;
    }

    /**
     * @return $this
     */
    public function getPhoneConfirmed()
    {
        return $this->phoneConfirmed;
    }

    /**
     * @param string $phoneConfirmedKey
     *
     * @return User
     */
    public function setPhoneConfirmedKey($phoneConfirmedKey)
    {
        $this->phoneConfirmed = $phoneConfirmedKey;

        return $this;
    }

    /**
     * @return $this
     */
    public function getPhoneConfirmedKey()
    {
        return $this->phoneConfirmedKey;
    }

    /**
     * Add messages
     *
     * @param \GovWiki\DbBundle\Entity\Message $messages
     * @return User
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
     * Add chats
     *
     * @param \GovWiki\DbBundle\Entity\Chat $chats
     * @return User
     */
    public function addChat(\GovWiki\DbBundle\Entity\Chat $chats)
    {
        $this->chats[] = $chats;

        return $this;
    }

    /**
     * Remove chats
     *
     * @param \GovWiki\DbBundle\Entity\Chat $chats
     */
    public function removeChat(\GovWiki\DbBundle\Entity\Chat $chats)
    {
        $this->chats->removeElement($chats);
    }

    /**
     * Get chats
     *
     * @return \Doctrine\Common\Collections\Collection 
     */
    public function getChats()
    {
        return $this->chats;
    }

    /**
     * @return boolean
     */
    public function isAdmin()
    {
        return in_array('ROLE_ADMIN', $this->roles, true);
    }
}
