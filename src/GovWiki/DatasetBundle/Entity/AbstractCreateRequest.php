<?php

namespace GovWiki\DatasetBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\QueryBuilder;
use Gedmo\Mapping\Annotation\Timestampable;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\RequestBundle\Entity\Interfaces\CreatableInterface;
use GovWiki\UserBundle\Entity\User;
use JMS\Serializer\Annotation\Groups;
use Symfony\Component\Form\FormInterface;

/**
 * AbstractCreateRequest
 *
 * @ORM\Table(name="changes)
 * @ORM\Entity(
 *  repositoryClass="GovWiki\RequestBundle\Entity\Repository\CreateRequestRepository"
 * )
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\MappedSuperclass()
 * @ORM\DiscriminatorColumn(name="type", type="string")
 * @ORM\DiscriminatorMap({
 *  "legislation"="LegislationCreateRequest",
 *  "contribution"="ContributionCreateRequest",
 *  "endorsement"="EndorsementCreateRequest",
 *  "public_statement"="PublicStatementCreateRequest"
 * })
 */
abstract class AbstractChange
{

    const STATE_PENDING = 'pending';
    const STATE_APPLIED = 'applied';
    const STATE_DISCARDED = 'discarded';

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
     * @ORM\Column(name="status", type="string", length=255)
     * @Groups({"elected_official"})
     */
    private $status = self::STATE_PENDING;

    /**
     * @var \DateTime $created
     *
     * @Timestampable(on="create")
     * @ORM\Column(type="datetime")
     */
    private $createdAt;

    /**
     * @ORM\ManyToOne(targetEntity="GovWiki\UserBundle\Entity\User")\
     * @ORM\JoinColumn(name="creator_id")
     * @Groups({"elected_official"})
     */
    private $creator;

    /**
     * @var Environment
     *
     * @ORM\ManyToOne(targetEntity="GovWiki\DbBundle\Entity\Environment")
     * @ORM\JoinColumn(name="environment_id")
     */
    private $environment;

    /**
     * @var string
     *
     * @ORM\Column()
     */
    protected $entityName;

    protected $subject;

    public function __construct()
    {
        $this->entityName = $this->currentEntityName();
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
     * Set status
     *
     * @param string $status
     *
     * @return AbstractCreateRequest
     */
    public function setStatus($status)
    {
        $this->status = $status;

        return $this;
    }

    /**
     * Get status
     *
     * @return string
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * Set created
     *
     * @param \DateTime $createdAt A \DateTime instance.
     *
     * @return AbstractCreateRequest
     */
    public function setCreatedAt(\DateTime $createdAt)
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    /**
     * Get created
     *
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * Set user
     *
     * @param User $creator A User instance.
     *
     * @return AbstractCreateRequest
     */
    public function setCreator(User $creator = null)
    {
        $this->creator = $creator;

        return $this;
    }

    /**
     * Get user
     *
     * @return User
     */
    public function getCreator()
    {
        return $this->creator;
    }

    /**
     * Set environment
     *
     * @param Environment $environment A Environment instance.
     *
     * @return AbstractCreateRequest
     */
    public function setEnvironment(Environment $environment = null)
    {
        $this->environment = $environment;

        return $this;
    }

    /**
     * Get environment
     *
     * @return Environment
     */
    public function getEnvironment()
    {
        return $this->environment;
    }

    /**
     * {@inheritdoc}
     */
    public function getSubject()
    {
        return $this->subject;
    }

    /**
     * {@inheritdoc}
     */
    public function setSubject(CreatableInterface $subject)
    {
        $this->subject = $subject;

        return $this;
    }

    /**
     * @return string
     */
    public function getEntityName()
    {
        return $this->entityName;
    }

    /**
     * @return FormInterface
     */
    abstract public function getFormType();

    /**
     * @return string
     */
    abstract protected function currentEntityName();
}
