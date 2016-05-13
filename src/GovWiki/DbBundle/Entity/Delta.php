<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Asset;

/**
 * Delta
 * Store all changes in government table.
 * Need for synchronization with CartoDB dataset.
 *
 * @ORM\Table(name="deltas")
 * @ORM\Entity(
 *  repositoryClass="GovWiki\DbBundle\Entity\Repository\DeltaRepository"
 * )
 */
class Delta
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
     * @ORM\Column(nullable=true)
     */
    private $slug;

    /**
     * @var string
     *
     * @ORM\Column(nullable=true)
     */
    private $altTypeSlug;

    /**
     * @var array
     *
     * @ORM\Column(type="array")
     */
    private $changes = [];

    /**
     * @var Environment
     *
     * @ORM\ManyToOne(targetEntity="Environment")
     */
    private $environment;

    /**
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set slug
     *
     * @param string $slug Government slug before change.
     *
     * @return Delta
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;

        return $this;
    }

    /**
     * Get slug
     *
     * @return string
     */
    public function getSlug()
    {
        return $this->slug;
    }

    /**
     * Set altTypeSlug
     *
     * @param string $altTypeSlug Government altTypeSlug before change.
     *
     * @return Delta
     */
    public function setAltTypeSlug($altTypeSlug)
    {
        $this->altTypeSlug = $altTypeSlug;

        return $this;
    }

    /**
     * Get altTypeSlug
     *
     * @return string
     */
    public function getAltTypeSlug()
    {
        return $this->altTypeSlug;
    }

    /**
     * Set changes
     *
     * @param array $changes Array of changes.
     *
     * @return Delta
     */
    public function setChanges(array $changes)
    {
        $this->changes = $changes;

        return $this;
    }

    /**
     * Get changes
     *
     * @return array
     */
    public function getChanges()
    {
        return $this->changes;
    }

    /**
     * Set environment
     *
     * @param Environment $environment A Environment entity instance.
     *
     * @return Delta
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
}
