<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
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
class Issue
{

    const LAST_AUDIT = 'audit';
    const OTHER = 'other';

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
     * @Choice(callback="availableTypes")
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
     * @var string
     *
     * @ORM\Column(nullable=true)
     */
    private $state;

    /**
     * Return available document types.
     *
     * @return array
     */
    public static function availableTypes()
    {
        return [
            self::LAST_AUDIT,
            self::OTHER,
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
     * Set state
     *
     * @param string $state
     * @return Issue
     */
    public function setState($state)
    {
        $this->state = $state;

        return $this;
    }

    /**
     * Get state
     *
     * @return string
     */
    public function getState()
    {
        return $this->state;
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