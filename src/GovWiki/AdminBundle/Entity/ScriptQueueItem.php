<?php

namespace GovWiki\AdminBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="script_queue")
 * @ORM\Entity(repositoryClass="GovWiki\AdminBundle\Entity\Repository\ScriptQueueItemRepository")
 */
class ScriptQueueItem
{

    /**
     * @var integer|null
     *
     * @ORM\Column(name="id", type="bigint", length=20)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\OneToOne(targetEntity="GovWiki\AdminBundle\Entity\Script")
     *
     * @var Script
     */
    private $script;

    /**
     * ScriptQueueItem constructor.
     *
     * @param Script $script A queued script.
     */
    public function __construct(Script $script)
    {
        $this->script = $script;
    }

    /**
     * @return integer|null
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return Script
     */
    public function getScript(): Script
    {
        return $this->script;
    }

    /**
     * @param Script $script A queued script.
     *
     * @return $this
     */
    public function setScript(Script $script): self
    {
        $this->script = $script;

        return $this;
    }
}
