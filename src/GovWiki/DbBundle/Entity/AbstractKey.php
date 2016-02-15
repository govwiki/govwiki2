<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation\Groups;

/**
 * @ORM\Table(name="generated_keys")
 * @ORM\Entity()
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\MappedSuperclass()
 * @ORM\DiscriminatorColumn(name="type", type="string")
 * @ORM\DiscriminatorMap({
 *  "comment"="GovWiki\CommentBundle\Entity\CommentKey"
 * })
 * @ORM\MappedSuperclass()
 */
abstract class AbstractKey
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
     * @var string
     *
     * @ORM\Column(name="`key`")
     */
    private $key;

    /**
     * @var \DateTime
     *
     * @ORM\Column(type="date")
     */
    private $created;

    /**
     *
     */
    public function __construct()
    {
        $this->created = new \DateTime();
    }

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
    public function getKey()
    {
        return $this->key;
    }

    /**
     * @param string $key Generated key.
     *
     * @return AbstractKey
     */
    public function setKey($key)
    {
        $this->key = $key;

        return $this;
    }

    /**
     * @return \DateTime
     */
    public function getCreated()
    {
        return $this->created;
    }

    /**
     * @param \DateTime $created A DateTime instance.
     *
     * @return CommentKey
     */
    public function setCreated(\DateTime $created)
    {
        $this->created = $created;

        return $this;
    }
}
