<?php

namespace GovWiki\AdminBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="script_execution_log")
 * @ORM\Entity(
 *     repositoryClass="GovWiki\AdminBundle\Entity\Repository\ScriptExecutionLogRepository"
 * )
 */
class ScriptExecutionLog
{

    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="bigint", length=20)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=45)
     *
     * @var string
     */
    private $name;

    /**
     * @ORM\Column(type="datetime")
     *
     * @var \DateTime
     */
    private $startTime;

    /**
     * @ORM\Column(type="datetime")
     *
     * @var \DateTime
     */
    private $endTime;

    /**
     * @ORM\Column(type="text")
     *
     * @var string
     */
    private $configFile;

    /**
     * @ORM\Column(type="integer", length=4)
     *
     * @var integer
     */
    private $result = 0;

    /**
     * @ORM\Column(type="text")
     *
     * @var string
     */
    private $errorMessage;

    /**
     * @return integer
     */
    public function getId(): int
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getName(): string
    {
        return $this->name;
    }

    /**
     * @param string $name Script name.
     *
     * @return $this
     */
    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    /**
     * @return \DateTime
     */
    public function getStartTime(): \DateTime
    {
        return $this->startTime;
    }

    /**
     * @param \DateTime $startTime When script start.
     *
     * @return $this
     */
    public function setStartTime(\DateTime $startTime): self
    {
        $this->startTime = $startTime;

        return $this;
    }

    /**
     * @return \DateTime
     */
    public function getEndTime(): \DateTime
    {
        return $this->endTime;
    }

    /**
     * @param \DateTime $endTime When script is end.
     *
     * @return $this
     */
    public function setEndTime(\DateTime $endTime): self
    {
        $this->endTime = $endTime;

        return $this;
    }

    /**
     * @return string
     */
    public function getConfigFile(): string
    {
        return $this->configFile;
    }

    /**
     * @param string $configFile Configuration file content.
     *
     * @return $this
     */
    public function setConfigFile(string $configFile): self
    {
        $this->configFile = $configFile;

        return $this;
    }

    /**
     * @return integer
     */
    public function getResult(): int
    {
        return $this->result;
    }

    /**
     * @param integer $result Execution result code.
     *
     * @return $this
     */
    public function setResult(int $result): self
    {
        $this->result = $result;

        return $this;
    }

    /**
     * @return string
     */
    public function getErrorMessage(): string
    {
        return $this->errorMessage;
    }

    /**
     * @param string $errorMessage Script error message.
     *
     * @return $this
     */
    public function setErrorMessage(string $errorMessage): self
    {
        $this->errorMessage = $errorMessage;

        return $this;
    }
}
