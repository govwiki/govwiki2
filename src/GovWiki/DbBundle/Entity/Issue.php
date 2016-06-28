<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use GovWiki\RequestBundle\Entity\AbstractCreatable;
use GovWiki\RequestBundle\Entity\IssueCreateRequest;
use GovWiki\UserBundle\Entity\User;
use Symfony\Component\Validator\Constraints\Choice;

/**
 * Document.
 * Some document relevant to government.
 *
 * @ORM\Table("issues")
 * @ORM\Entity(
 *  repositoryClass="GovWiki\DbBundle\Entity\Repository\IssuesRepository"
 * )
 */
class Issue extends AbstractCreatable
{

    const LAST_AUDIT = 'audit';
    const OTHER = 'other';
    const NEWS_REPORT = 'news_report';
    const GOVT_DOCUMENT = 'govt_document';
    const CPC_RESEARCH = 'cpc_research';
    const BLOG_POST = 'blog_post';
    const VIDEO_CLIP = 'video_clip';
    const IMAGE = 'image';
    const AUDIO_CLIP = 'audio_clip';

    const PENDING = 'pending';
    const APPROVED = 'approved';
    const DISCARDED = 'discarded';

    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var Government
     *
     * @ORM\ManyToOne(targetEntity="Government", inversedBy="issues")
     */
    private $government;

    /**
     * @var string
     *
     * @ORM\Column(type="text", nullable=true)
     */
    private $description;

    /**
     * @var string
     *
     * @ORM\Column()
     * @Choice(callback="availableTypeNames")
     */
    private $type = self::LAST_AUDIT;

    /**
     * @var string
     *
     * @ORM\Column()
     */
    private $link;

    /**
     * @var \DateTime
     *
     * @ORM\Column(type="date")
     */
    private $date;

    /**
     * @var string
     *
     * @ORM\Column()
     */
    private $name;

    /**
     * @var User
     *
     * @ORM\ManyToOne(targetEntity="GovWiki\UserBundle\Entity\User")
     */
    private $creator;

    /**
     * @var CreateRequest
     *
     * @ORM\OneToOne(
     *  targetEntity="GovWiki\RequestBundle\Entity\IssueCreateRequest",
     *  inversedBy="subject"
     * )
     */
    protected $request;

    /**
     * Return available document type names.
     *
     * @return array
     */
    public static function availableTypeNames()
    {
        return [
            self::LAST_AUDIT,
            self::OTHER,
            self::NEWS_REPORT,
            self::GOVT_DOCUMENT,
            self::CPC_RESEARCH,
            self::BLOG_POST,
            self::VIDEO_CLIP,
            self::IMAGE,
            self::AUDIO_CLIP,
        ];
    }

    /**
     * Return available document types.
     *
     * @return array
     */
    public static function  availableTypes()
    {
        return [
            self::LAST_AUDIT => 'Audit',
            self::OTHER => 'Other',
            self::NEWS_REPORT => 'News Report',
            self::GOVT_DOCUMENT => 'Govt Document',
            self::CPC_RESEARCH => 'CPC Research',
            self::BLOG_POST => 'Blog Post',
            self::VIDEO_CLIP => 'Video Clip',
            self::IMAGE => 'Image',
            self::AUDIO_CLIP => 'Audio Clip',
        ];
    }

    /**
     *
     */
    public function __construct()
    {
        $this->date = new \DateTime();
    }


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
     * Set description
     *
     * @param string $description Document description.
     *
     * @return Issue
     */
    public function setDescription($description)
    {
        $this->description = $description;

        return $this;
    }

    /**
     * Get description
     *
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * Set type
     *
     * @param string $type Document type, one of
     *                     {@see Document::availableTypes}.
     *
     * @return Issue
     */
    public function setType($type)
    {
        $this->type = $type;

        return $this;
    }

    /**
     * Get type
     *
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @return string
     */
    public function getDisplayType()
    {
        return self::availableTypes()[$this->type];
    }

    /**
     * Set link
     *
     * @param string $link Link to Issue, maybe on our host or internet.
     *
     * @return Issue
     */
    public function setLink($link)
    {
        $this->link = $link;

        return $this;
    }

    /**
     * Get link
     *
     * @return string
     */
    public function getLink()
    {
        return $this->link;
    }

    /**
     * @return \DateTime
     */
    public function getDate()
    {
        return $this->date;
    }

    /**
     * @param \DateTime $date A Issue placement date.
     *
     * @return Issue
     */
    public function setDate(\DateTime $date = null)
    {
        if (null === $date) {
            $date = new \DateTime();
        }
        $this->date = $date;

        return $this;
    }

    /**
     * Set government
     *
     * @param Government $government A Government entity id.
     *
     * @return Issue
     */
    public function setGovernment(Government $government = null)
    {
        $this->government = $government;

        return $this;
    }

    /**
     * Get government
     *
     * @return Government
     */
    public function getGovernment()
    {
        return $this->government;
    }

    /**
     * Set name
     *
     * @param string $name Issue name.
     *
     * @return Issue
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * Get name
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Set creator
     *
     * @param User $creator A User entity instance.
     *
     * @return Issue
     */
    public function setCreator(User $creator = null)
    {
        $this->creator = $creator;

        return $this;
    }

    /**
     * Get creator
     *
     * @return User
     */
    public function getCreator()
    {
        return $this->creator;
    }
}
