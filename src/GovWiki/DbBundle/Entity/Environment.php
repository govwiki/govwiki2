<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Environment
 *
 * @ORM\Table(name="environments")
 * @ORM\Entity(
 *  repositoryClass="GovWiki\DbBundle\Entity\Repository\EnvironmentRepository"
 * )
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
    private $id;

    /**
     * @var string
     *
     * @ORM\Column()
     */
    private $name;

    /**
     * @var Map
     * @ORM\ManyToOne(targetEntity="Map")
     * @ORM\JoinColumn(name="map_id")
     */
    private $map;

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
        $this->name = $name;

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
     * @param Map $map A Mapping instance.
     *
     * @return Environment
     */
    public function setMap(Map $map)
    {
        $this->map = $map;

        return $this;
    }
}
