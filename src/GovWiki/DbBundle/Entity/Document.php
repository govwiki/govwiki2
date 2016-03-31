<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation\Timestampable;
use Symfony\Component\Validator\Constraints\Choice;

/**
 * Document.
 * Some document relevant to government.
 *
 * @ORM\Table("documents")
 * @ORM\Entity(
 *  repositoryClass="GovWiki\DbBundle\Entity\Repository\DocumentRepository"
 * )
 */
class Document
{

    const LAST_AUDIT = 'audit';
    const OTHER = 'other';

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
     * @ORM\ManyToOne(targetEntity="Government", inversedBy="documents")
     */
    private $government;

    /**
     * @var string
     *
     * @ORM\Column(nullable=true)
     */
    private $name;

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
     * @Timestampable(on="create")
     * @ORM\Column(type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     *
     * @Timestampable(on="update")
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $updatedAt;

    /**
     * @var integer
     *
     * @ORM\Column(type="integer")
     */
    private $year;

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
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set name
     *
     * @param string $name Document name, maybe null, but must be set for
     *                     {@see Document::OTHER}.
     *
     * @return Document
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
     * Set type
     *
     * @param string $type Document type, one of
     *                     {@see Document::availableTypes}.
     *
     * @return Document
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
     * @param string $link Link to document, maybe on our host or internet.
     *
     * @return Document
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
     * Set createdAt
     *
     * @param \DateTime $createdAt A DateTime instance.
     *
     * @return Document
     */
    public function setCreatedAt(\DateTime $createdAt)
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    /**
     * Get createdAt
     *
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * Set updatedAt
     *
     * @param \DateTime $updatedAt A DateTime instance.
     *
     * @return Document
     */
    public function setUpdatedAt(\DateTime $updatedAt)
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    /**
     * Get updatedAt
     *
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    /**
     * Set year
     *
     * @param integer $year Document placement year.
     *
     * @return Document
     */
    public function setYear($year)
    {
        $this->year = $year;

        return $this;
    }

    /**
     * Get year
     *
     * @return integer
     */
    public function getYear()
    {
        return $this->year;
    }

    /**
     * Set government
     *
     * @param Government $government A Government entity id.
     *
     * @return Document
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
}
