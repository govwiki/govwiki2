<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use GovWiki\UserBundle\Entity\User;
use JMS\Serializer\Annotation\Groups;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Validator\Constraints as Assert;

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
     * @Assert\Regex(pattern="|^[\w\s]+$|")
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column()
     *
     * @Groups({"map"})
     */
    private $slug;

    /**
     * @var string
     *
     * @ORM\Column()
     * @Assert\NotBlank()
     */
    private $domain;

    /**
     * Use bem like syntax.
     *
     * @var string
     *
     * @ORM\Column(type="json_array")
     */
    private $style;

    /**
     * @var string
     *
     * @ORM\Column(type="text")
     * @Assert\NotBlank()
     */
    private $greetingText;

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
     *  cascade={"persist", "remove"}
     *)
     * @ORM\JoinColumn(name="map_id")
     */
    private $map;

    /**
     * @var Collection
     *
     * @ORM\OneToMany(
     *  targetEntity="Government",
     *  mappedBy="environment",
     *  cascade={"remove"}
     * )
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
     *  mappedBy="environment",
     *  cascade={"remove"}
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
        $this->name = trim($name);
        $this->slug = self::slugify($this->name);

        return $this;
    }

    /**
     * @param string $str String to slugiffy.
     *
     * @return string
     */
    public static function slugify($str)
    {
        return preg_replace('|[^\w\d]|', '_', strtolower($str));
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
     * @return string
     */
    public function getStyle()
    {
        return $this->style;
    }

    /**
     * @param string $style
     *
     * @return Environment
     */
    public function setStyle($style)
    {
        $this->style = $style;

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
    public function getFormats()
    {
        return $this->formats;
    }

    /**
     * @param Format $format A Format instance.
     *
     * @return Environment
     */
    public function addFormats(Format $format)
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

    /**
     * @return string
     */
    public function getSlug()
    {
        return $this->slug;
    }
}
