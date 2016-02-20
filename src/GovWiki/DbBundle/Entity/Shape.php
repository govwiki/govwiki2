<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Shape
 *
 * @ORM\Table(name="shapes")
 * @ORM\Entity(
 *  repositoryClass="GovWiki\DbBundle\Entity\Repository\ShapeRepository"
 * )
 */
class Shape
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
     * Path to shape file.
     *
     * @var string
     *
     * @ORM\Column()
     */
    private $path;

    /**
     * Shape name
     *
     * @var string
     *
     * @ORM\Column()
     */
    private $name;

    /**
     * @var UploadedFile
     */
    private $file;

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
    public function getPath()
    {
        return $this->path;
    }

    /**
     * @param string $path Path to shape image.
     *
     * @return Shape
     */
    public function setPath($path)
    {
        $this->path = $path;

        return $this;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string $name Shape name.
     *
     * @return Shape
     */
    public function setName($name)
    {
        $this->name = $name;

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
     * @return Shape
     */
    public function setFile(UploadedFile $file = null)
    {
        $this->file = $file;

        return $this;
    }

    /**
     * @return boolean
     */
    public function isUploaded()
    {
        return $this->file !== null;
    }

    /**
     * @return string
     */
    public function __toString()
    {
        return $this->name;
    }
}
