<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use GovWiki\UserBundle\Entity\User;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;

/**
 * Environment
 *
 * @ORM\Table(name="environments")
 * @ORM\Entity(
 *  repositoryClass="GovWiki\DbBundle\Entity\Repository\EnvironmentRepository"
 * )
 *
 * @UniqueEntity("name")
 */
class Environment
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
     * @ORM\Column(unique=true)
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column()
     */
    private $domain;

    /**
     * @var string
     *
     * @ORM\Column(type="text")
     */
    private $header;

    /**
     * @var string
     *
     * @ORM\Column(type="text")
     */
    private $greetingText;

    /**
     * @var string
     *
     * @ORM\Column(type="text")
     */
    private $footer;

    /**
     * @var boolean
     *
     * @ORM\Column(type="boolean")
     */
    private $enabled = false;

    /**
     * @var Map
     *
     * @ORM\OneToOne(
     *  targetEntity="Map",
     *  inversedBy="environment",
     *  cascade={"remove"}
     *)
     * @ORM\JoinColumn(name="map_id")
     */
    private $map;

    /**
     * @var Collection
     *
     * @ORM\OneToMany(targetEntity="Government", mappedBy="environment")
     */
    private $governments;

    /**
     * @var Collection
     *
     * @ORM\OneToMany(
     *  targetEntity="Format",
     *  mappedBy="environment",
     *  cascade={"remove", "persist"}
     *)
     */
    private $formats;

    /**
     * @var Collection
     *
     * @ORM\ManyToMany(
     *  targetEntity="GovWiki\UserBundle\Entity\User",
     *  mappedBy="environments"
     * )
     */
    private $users;

    /**
     * @var Collection
     *
     * @ORM\OneToMany(
     *  targetEntity="AbstractGroup",
     *  mappedBy="environment"
     * )
     */
    private $groups;

    /**
     *
     */
    public function __construct()
    {
        $this->governments = new ArrayCollection();
        $this->formats = new ArrayCollection();
    }

    /**
     * @return string
     */
    public function __toString()
    {
        return $this->name;
    }

    /**
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string $name Environment name.
     *
     * @return Environment
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * @return string
     */
    public function getDomain()
    {
        return $this->domain;
    }

    /**
     * @param string $domain Environment domain name.
     *
     * @return Environment
     */
    public function setDomain($domain)
    {
        $this->domain = $domain;

        return $this;
    }

    /**
     * @return string
     */
    public function getHeader()
    {
        return $this->header;
    }

    /**
     * @param string $header
     *
     * @return Environment
     */
    public function setHeader($header)
    {
        $this->header = $header;

        return $this;
    }

    /**
     * @return string
     */
    public function getGreetingText()
    {
        return $this->greetingText;
    }

    /**
     * @param string $greetingText
     *
     * @return Environment
     */
    public function setGreetingText($greetingText)
    {
        $this->greetingText = $greetingText;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getFooter()
    {
        return $this->footer;
    }

    /**
     * @param mixed $footer
     *
     * @return Environment
     */
    public function setFooter($footer)
    {
        $this->footer = $footer;

        return $this;
    }

    /**
     * @return boolean
     */
    public function isEnabled()
    {
        return $this->enabled;
    }

    /**
     * @param boolean $enabled
     *
     * @return Environment
     */
    public function setEnabled($enabled)
    {
        $this->enabled = $enabled;

        return $this;
    }

    /**
     * @return Environment
     */
    public function toggleEnabled()
    {
        $this->enabled = ! $this->enabled;

        return $this;
    }

    /**
     * @return Map
     */
    public function getMap()
    {
        return $this->map;
    }

    /**
     * @param Map $map A Map instance.
     *
     * @return Environment
     */
    public function setMap(Map $map)
    {
        $this->map = $map;

        return $this;
    }

    /**
     * @return Format
     */
    public function getFormat()
    {
        return $this->formats;
    }

    /**
     * @param Format $format A Format instance.
     *
     * @return Environment
     */
    public function addFormat(Format $format)
    {
        $format->setEnvironment($this);
        $this->formats[] = $format;

        return $this;
    }

    /**
     * @param Format $format A Format instance.
     *
     * @return Environment
     */
    public function removeFormat(Format $format)
    {
        $format->setEnvironment(null);
        $this->formats->removeElement($format);

        return $this;
    }

    /**
     * Add government
     *
     * @param Government $government A Government instance.
     *
     * @return Environment
     */
    public function addGovernment(Government $government)
    {
        $this->governments[] = $government;

        return $this;
    }

    /**
     * Remove government
     *
     * @param Government $government A Government instance.
     *
     * @return Environment
     */
    public function removeGovernment(Government $government)
    {
        $this->governments->removeElement($government);

        return $this;
    }

    /**
     * Get government
     *
     * @return Collection
     */
    public function getGovernments()
    {
        return $this->governments;
    }

    /**
     * Add user
     *
     * @param User $user A User instance.
     *
     * @return Environment
     */
    public function addUser(User $user)
    {
        $this->users[] = $user;

        return $this;
    }

    /**
     * Remove user
     *
     * @param User $user A User instance.
     *
     * @return Environment
     */
    public function removeUser(User $user)
    {
        $this->users->removeElement($user);

        return $this;
    }

    /**
     * Get user
     *
     * @return Collection
     */
    public function getUsers()
    {
        return $this->users;
    }

    /**
     * Add group
     *
     * @param AbstractGroup $group A AbstractGroup instance.
     *
     * @return Environment
     */
    public function addGroup(AbstractGroup $group)
    {
        $this->groups[] = $group;

        return $this;
    }

    /**
     * Remove group
     *
     * @param AbstractGroup $group A AbstractGroup instance.
     *
     * @return Environment
     */
    public function removeGroup(AbstractGroup $group)
    {
        $this->groups->removeElement($group);

        return $this;
    }

    /**
     * Get groups
     *
     * @return Collection
     */
    public function getGroups()
    {
        return $this->groups;
    }
}
