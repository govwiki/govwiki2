<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\QueryBuilder;
use GovWiki\DbBundle\Form\PublicStatementType;
use GovWiki\RequestBundle\Entity\AbstractCreatable;
use GovWiki\RequestBundle\Entity\PublicStatementCreateRequest;
use JMS\Serializer\Annotation\Groups;

/**
 * PublicStatement
 *
 * @ORM\Table(name="public_statements")
 * @ORM\Entity(
 *  repositoryClass="GovWiki\DbBundle\Entity\Repository\PublicStatementRepository"
 * )
 */
class PublicStatement extends AbstractCreatable implements
    StaffEntityInterface
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     * @Groups({"elected_official"})
     */
    private $id;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="date", type="date", nullable=true)
     * @Groups({"elected_official"})
     */
    private $date;

    /**
     * @var string
     *
     * @ORM\Column(name="summary", type="string", length=255, nullable=true)
     * @Groups({"elected_official"})
     */
    private $summary;

    /**
     * @var string
     *
     * @ORM\Column(name="url", type="string", length=255, nullable=true)
     * @Groups({"elected_official"})
     */
    private $url;

    /**
     * @ORM\ManyToOne(targetEntity="ElectedOfficial", inversedBy="publicStatements")
     */
    private $electedOfficial;

    /**
     * @ORM\ManyToOne(targetEntity="IssueCategory", inversedBy="publicStatements")
     * @Groups({"elected_official"})
     */
    private $issueCategory;

    /**
     * @var PublicStatementCreateRequest
     *
     * @ORM\OneToOne(
     *  targetEntity="GovWiki\RequestBundle\Entity\PublicStatementCreateRequest",
     *  inversedBy="subject",
     *  cascade={ "persist", "remove" }
     * )
     * @ORM\JoinColumn(name="request_id")
     */
    protected $request;

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
     * Set date
     *
     * @param \DateTime $date
     * @return PublicStatement
     */
    public function setDate($date)
    {
        $this->date = $date;

        return $this;
    }

    /**
     * Get date
     *
     * @return \DateTime
     */
    public function getDate()
    {
        return $this->date;
    }

    /**
     * Set summary
     *
     * @param string $summary
     * @return PublicStatement
     */
    public function setSummary($summary)
    {
        $this->summary = $summary;

        return $this;
    }

    /**
     * Get summary
     *
     * @return string
     */
    public function getSummary()
    {
        return $this->summary;
    }

    /**
     * Set url
     *
     * @param string $url
     * @return PublicStatement
     */
    public function setUrl($url)
    {
        $this->url = $url;

        return $this;
    }

    /**
     * Get url
     *
     * @return string
     */
    public function getUrl()
    {
        return $this->url;
    }

    /**
     * Set electedOfficial
     *
     * @param \GovWiki\DbBundle\Entity\ElectedOfficial $electedOfficial
     * @return PublicStatement
     */
    public function setElectedOfficial(\GovWiki\DbBundle\Entity\ElectedOfficial $electedOfficial = null)
    {
        $this->electedOfficial = $electedOfficial;

        return $this;
    }

    /**
     * Get electedOfficial
     *
     * @return \GovWiki\DbBundle\Entity\ElectedOfficial
     */
    public function getElectedOfficial()
    {
        return $this->electedOfficial;
    }

    /**
     * Set issueCategory
     *
     * @param \GovWiki\DbBundle\Entity\IssueCategory $issueCategory
     * @return PublicStatement
     */
    public function setIssueCategory(\GovWiki\DbBundle\Entity\IssueCategory $issueCategory = null)
    {
        $this->issueCategory = $issueCategory;

        return $this;
    }

    /**
     * Get issueCategory
     *
     * @return \GovWiki\DbBundle\Entity\IssueCategory
     */
    public function getIssueCategory()
    {
        return $this->issueCategory;
    }

    /**
     * {@inheritdoc}
     */
    public static function getFormType()
    {
        return new PublicStatementType();
    }
}
