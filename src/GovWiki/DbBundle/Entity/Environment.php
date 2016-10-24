<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use GovWiki\EnvironmentBundle\Strategy\GovwikiNamingStrategy;
use GovWiki\UserBundle\Entity\User;
use JMS\Serializer\Annotation\Groups;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Environment
 *
 * @ORM\Table(name="environments")
 * @ORM\Entity(
 *  repositoryClass="GovWiki\DbBundle\Entity\Repository\EnvironmentRepository"
 * )
 *
 * @UniqueEntity({"name"})
 * @UniqueEntity({"domain"})
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
    protected $id;

    /**
     * @var string
     *
     * @ORM\Column(unique=true)
     * @Assert\Regex(pattern="|^[\w\s]+$|")
     */
    protected $name;

    /**
     * @var string
     *
     * @ORM\Column()
     */
    protected $title;

    /**
     * @var string
     *
     * @ORM\Column()
     *
     * @Groups({"map"})
     */
    protected $slug;

    /**
     * @var string
     *
     * @ORM\Column()
     * @Assert\NotBlank()
     */
    protected $domain;

    /**
     * CSS styles.
     *
     * @var string
     *
     * @ORM\Column(type="text", nullable=true)
     */
    protected $style;

    /**
     * CSS styles for mobile view.
     *
     * @var string
     *
     * @ORM\Column(type="text", nullable=true)
     */
    protected $mobileStyle;

    /**
     * @var boolean
     *
     * @ORM\Column(type="boolean")
     */
    protected $enabled = false;

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
    protected $map;

    /**
     * @var Collection
     *
     * @ORM\OneToMany(
     *  targetEntity="Government",
     *  mappedBy="environment",
     *  cascade={"remove"}
     * )
     */
    protected $governments;

    /**
     * @var Collection
     *
     * @ORM\OneToMany(
     *  targetEntity="Format",
     *  mappedBy="environment",
     *  cascade={"remove", "persist"}
     *)
     */
    protected $formats;

    /**
     * @var Collection
     *
     * @ORM\ManyToMany(
     *  targetEntity="GovWiki\UserBundle\Entity\User",
     *  mappedBy="environments"
     * )
     */
    protected $users;

    /**
     * @var Collection
     *
     * @ORM\OneToMany(
     *  targetEntity="AbstractGroup",
     *  mappedBy="environment",
     *  cascade={"remove"}
     * )
     */
    protected $groups;

    /**
     * @var Collection
     *
     * @ORM\OneToMany(targetEntity="Locale", mappedBy="environment", cascade={"remove"})
     */
    protected $locales;

    /**
     * @var Locale
     *
     * @ORM\OneToOne(targetEntity="Locale")
     */
    protected $defaultLocale;

    /**
     * @var string
     *
     * @ORM\Column()
     */
    protected $adminEmail;

    /**
     * @var \DateTime
     *
     * @ORM\Column(type="array")
     */
    protected $legislationDisplayTime = [
        'hours' => 72,
        'minutes' => 0,
    ];

    /**
     * @var string
     *
     * @ORM\Column(nullable=true)
     */
    protected $logoHref;

    /**
     * @var string
     *
     * @ORM\Column(nullable=true)
     */
    protected $logo;

    /**
     * @var UploadedFile
     */
    protected $file;

    /**
     * @var boolean
     *
     * @ORM\Column(type="boolean")
     */
    protected $subscribable = false;

    /**
     * @var boolean
     *
     * @ORM\Column(type="boolean")
     */
    protected $showDocuments = false;

    /**
     * @var string
     *
     * @ORM\Column(nullable=true)
     */
    protected $mainImage;

    /**
     * @var Collection
     *
     * @ORM\OneToMany(targetEntity="Monetization", mappedBy="environment")
     */
    protected $monetization;

    /**
     * @var boolean
     *
     * @ORM\Column(type="boolean")
     */
    protected $showGovernmentComment;

    /**
     * @var string
     *
     * @ORM\Column(type="text", nullable=true)
     */
    protected $analytics;

    /**
     * @var string
     */
    protected $cartoDBPrefix = '';

    /**
     * @var boolean
     *
     * @ORM\Column(type="boolean")
     */
    protected $canLogin = true;

    /**
     *
     */
    public function __construct()
    {
        $this->governments = new ArrayCollection();
        $this->formats = new ArrayCollection();
        $this->locales = new ArrayCollection();
        $this->advertising = new ArrayCollection();
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
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * @param string $title Page title.
     *
     * @return Environment
     */
    public function setTitle($title)
    {
        $this->title = $title;

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
     * @return Collection
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

    /**
     * Add locales
     *
     * @param Locale $locales A Locale entity instance.
     *
     * @return Environment
     */
    public function addLocale(Locale $locales)
    {
        $this->locales[] = $locales;

        return $this;
    }

    /**
     * Remove locales
     *
     * @param Locale $locales A Locale entity instance.
     *
     * @return Environment
     */
    public function removeLocale(Locale $locales)
    {
        $this->locales->removeElement($locales);

        return $this;
    }

    /**
     * Get locales
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getLocales()
    {
        return $this->locales;
    }



    /**
     * @return string
     */
    public function getAdminEmail()
    {
        return $this->adminEmail;
    }

    /**
     * @param string $adminEmail
     *
     * @return Environment
     */
    public function setAdminEmail($adminEmail)
    {
        $this->adminEmail = $adminEmail;

        return $this;
    }

    /**
     * @return Locale
     */
    public function getDefaultLocale()
    {
        return $this->defaultLocale;
    }

    /**
     * @param Locale $defaultLocale A Locale instance.
     *
     * @return Environment
     */
    public function setDefaultLocale(Locale $defaultLocale)
    {
        $this->defaultLocale = $defaultLocale;

        return $this;
    }

    /**
     * @return array
     */
    public function getLegislationDisplayTime()
    {
        if ($this->legislationDisplayTime === null) {
            $this->legislationDisplayTime = [
                'hours' => 72,
                'minutes' => 0,
            ];
        }

        return $this->legislationDisplayTime;
    }

    /**
     * @param array $legislationDisplayTime Delay between apply and display of
     *                                      legislation:
     *                                       - hours;
     *                                       - minutes.
     *
     * @return Environment
     */
    public function setLegislationDisplayTime(array $legislationDisplayTime)
    {
        $this->legislationDisplayTime = $legislationDisplayTime;

        return $this;
    }

    /**
     * @return string
     */
    public function getLogoHref()
    {
        return $this->logoHref;
    }

    /**
     * @param string $logoHref A href link for logo img.
     *
     * @return Environment
     */
    public function setLogoHref($logoHref)
    {
        $this->logoHref = $logoHref;

        return $this;
    }

    /**
     * @return string
     */
    public function getLogo()
    {
        return $this->logo;
    }

    /**
     * @param string $logo Path to environment logo.
     *
     * @return Environment
     */
    public function setLogo($logo)
    {
        $this->logo = $logo;

        return $this;
    }

    /**
     * @return UploadedFile
     */
    public function getFile()
    {
        return $this->file;
    }

    /**
     * @param UploadedFile $file A UploadedFile instance.
     *
     * @return Environment
     */
    public function setFile(UploadedFile $file)
    {
        $this->file = $file;

        return $this;
    }

    /**
     * Set subscribable
     *
     * @param boolean $subscribable
     *
     * @return Environment
     */
    public function setSubscribable($subscribable)
    {
        $this->subscribable = $subscribable;

        return $this;
    }

    /**
     * Get subscribable
     *
     * @return boolean
     */
    public function getSubscribable()
    {
        return $this->subscribable;
    }

    /**
     * @return boolean
     */
    public function isShowDocuments()
    {
        return $this->showDocuments;
    }

    /**
     * @param boolean $showDocuments Flag.
     *
     * @return Environment
     */
    public function setShowDocuments($showDocuments)
    {
        $this->showDocuments = $showDocuments;

        return $this;
    }

    /**
     * @return string
     */
    public function getMainImage()
    {
        return $this->mainImage;
    }

    /**
     * @param string $mainImage New path to main image.
     *
     * @return Environment
     */
    public function setMainImage($mainImage)
    {
        $this->mainImage = $mainImage;

        return $this;
    }

    /**
     * Add monetization
     *
     * @param Monetization $monetization A Monetization entity instance.
     *
     * @return Environment
     */
    public function addAdvertising(Monetization $monetization)
    {
        $this->monetization[] = $monetization;

        return $this;
    }

    /**
     * Remove monetization
     *
     * @param Monetization $monetization A Monetization entity instance.
     *
     * @return Environment
     */
    public function removeAdvertising(Monetization $monetization)
    {
        $this->monetization->removeElement($monetization);

        return $this;
    }

    /**
     * Get advertising
     *
     * @return Collection
     */
    public function getAdvertising()
    {
        return $this->monetization;
    }

    /**
     * Set mobileStyle
     *
     * @param string $mobileStyle Css rules.
     *
     * @return Environment
     */
    public function setMobileStyle($mobileStyle)
    {
        $this->mobileStyle = $mobileStyle;

        return $this;
    }

    /**
     * Get mobileStyle
     *
     * @return string
     */
    public function getMobileStyle()
    {
        return $this->mobileStyle;
    }

    /**
     * Generate css rules.
     *
     * @param array|EnvironmentStyles[] $styles List of styles.
     * @param string                    $type   Style type: desktop or mobile.
     *
     * @return Environment
     */
    public function updateStyle(array $styles, $type)
    {
        $css = '';

        foreach ($styles as $style) {
            $css .= $style->getClassName() .'{';
            foreach ($style->getProperties() as $property) {
                $css .= $property[0] .':'. $property[1] .';';
            }
            $css .= '}';
        }

        switch ($type) {
            case 'desktop':
                $this->setStyle($css);
                break;

            case 'mobile':
                $this->setMobileStyle($css);
                break;
        }

        return $this;
    }

    /**
     * Set showGovernmentComment
     *
     * @param boolean $showGovernmentComment Whether to show comment form.
     *
     * @return Environment
     */
    public function setShowGovernmentComment($showGovernmentComment)
    {
        $this->showGovernmentComment = $showGovernmentComment;

        return $this;
    }

    /**
     * Is showGovernmentComment
     *
     * @return boolean
     */
    public function isShowGovernmentComment()
    {
        return $this->showGovernmentComment;
    }

    /**
     * Set analytics
     *
     * @param string $analytics Analytics code.
     *
     * @return Environment
     */
    public function setAnalytics($analytics)
    {
        $this->analytics = $analytics;

        return $this;
    }

    /**
     * Get analytics
     *
     * @return string
     */
    public function getAnalytics()
    {
        return $this->analytics;
    }

    /**
     * @param string $cartoDBPrefix Prefix for cartodb dataset.
     *
     * @return Environment
     */
    public function setCartoDBPrefix($cartoDBPrefix)
    {
        $this->cartoDBPrefix = $cartoDBPrefix;

        return $this;
    }

    /**
     * @return string
     */
    public function getCartoDBPrefix()
    {
        return $this->cartoDBPrefix;
    }

    /**
     * Return dataset name for current environment.
     *
     * @return string
     */
    public function getDatasetName()
    {
        return GovwikiNamingStrategy::cartoDbDatasetName($this);
    }

    /**
     * Set canLogin
     *
     * @param boolean $canLogin If user can login on this environment.
     *
     * @return Environment
     */
    public function setCanLogin($canLogin)
    {
        $this->canLogin = $canLogin;

        return $this;
    }

    /**
     * Get canLogin
     *
     * @return boolean
     */
    public function isCanLogin()
    {
        return $this->canLogin;
    }
}
