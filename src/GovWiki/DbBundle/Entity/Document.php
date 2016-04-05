<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\UploadedFile;
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
     * @return Document
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
     * @return \DateTime
     */
    public function getDate()
    {
        return $this->date;
    }

    /**
     * @param \DateTime $date A Document placement date.
     *
     * @return Document
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
