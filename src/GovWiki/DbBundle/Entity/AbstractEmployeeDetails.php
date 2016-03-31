<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * AbstractEmployeeDetails
 *
 * @ORM\MappedSuperclass()
 */
class AbstractEmployeeDetails
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
     * @var Government
     */
    protected $government;

    /**
     * @var Employee
     *
     * @ORM\ManyToOne(targetEntity="Employee")
     */
    private $employee;

    /**
     * @var Job
     *
     * @ORM\ManyToOne(targetEntity="Job")
     */
    private $job;

    /**
     * @var integer
     *
     * @ORM\Column(type="integer")
     */
    private $year;

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
     * @return Government
     */
    public function getGovernment()
    {
        return $this->government;
    }

    /**
     * @param Government $government A Government entity instance.
     *
     * @return AbstractEmployeeDetails
     */
    public function setGovernment(Government $government)
    {
        $this->government = $government;

        return $this;
    }

    /**
     * @return string
     */
    public function getEmployee()
    {
        return $this->employee;
    }

    /**
     * @param string $employee Employee name.
     *
     * @return AbstractEmployeeDetails
     */
    public function setEmployee($employee)
    {
        $this->employee = $employee;

        return $this;
    }

    /**
     * @return Job
     */
    public function getJob()
    {
        return $this->job;
    }

    /**
     * @param Job $job A Job entity instance.
     *
     * @return AbstractEmployeeDetails
     */
    public function setJob(Job $job)
    {
        $this->job = $job;

        return $this;
    }

    /**
     * @return integer
     */
    public function getYear()
    {
        return $this->year;
    }

    /**
     * @param integer $year Year of information.
     *
     * @return AbstractEmployeeDetails
     */
    public function setYear($year)
    {
        $this->year = $year;

        return $this;
    }
}
