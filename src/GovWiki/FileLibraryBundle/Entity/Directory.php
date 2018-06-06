<?php

namespace GovWiki\FileLibraryBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use GovWiki\DbBundle\Entity\Environment;

/**
 * Class Directory
 *
 * @ORM\Entity
 *
 * @package GovWiki\FileLibraryBundle\Entity
 */
class Directory extends AbstractFile
{

    /**
     * @var Collection
     *
     * @ORM\OneToMany(targetEntity="GovWiki\FileLibraryBundle\Entity\AbstractFile", mappedBy="parent", cascade={ "ALL" })
     */
    private $childes;

    /**
     * AbstractFile constructor.
     *
     * @param Environment $environment Required environment.
     * @param string      $name        A filename.
     * @param string      $publicPath  A public path to file.
     * @param string      $slug        A filename slug.
     * @param Directory   $parent      A parent directory.
     */
    public function __construct(
        Environment $environment,
        string $name,
        string $publicPath,
        string $slug,
        Directory $parent = null
    ) {
        parent::__construct($environment, $name, $publicPath, $slug, null, $parent);
        $this->childes = new ArrayCollection();
    }

    /**
     * @return Collection
     */
    public function getChildes(): Collection
    {
        return $this->childes;
    }

    /**
     * @param AbstractFile $file A added file.
     *
     * @return $this
     */
    public function addChild(AbstractFile $file)
    {
        $this->childes[] = $file->setParent($this);

        return $this;
    }

    /**
     * @param AbstractFile $file A removed file.
     *
     * @return $this
     */
    public function removeChild(AbstractFile $file)
    {
        $this->childes->removeElement($file->setParent(null));

        return $this;
    }

    /**
     * @return boolean
     */
    public function isDirectory(): bool
    {
        return true;
    }

    /**
     * @return boolean
     */
    public function isDocument(): bool
    {
        return false;
    }
}
