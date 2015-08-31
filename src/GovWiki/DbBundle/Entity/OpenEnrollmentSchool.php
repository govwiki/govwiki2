<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * OpenEnrollmentSchool
 *
 * @ORM\Table(name="open_enrollment_schools")
 * @ORM\Entity
 */
class OpenEnrollmentSchool
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
     * @ORM\Column(name="state_id", type="string", length=255, nullable=true)
     */
    private $stateId;

    /**
     * @var string
     *
     * @ORM\Column(name="county", type="string", length=255, nullable=true)
     */
    private $county;

    /**
     * @var string
     *
     * @ORM\Column(name="district_name", type="string", length=255, nullable=true)
     */
    private $districtName;

    /**
     * @var string
     *
     * @ORM\Column(name="list_of_schools", type="string", length=255, nullable=true)
     */
    private $listOfSchools;

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
     * Set stateId
     *
     * @param string $stateId
     * @return OpenEnrollmentSchool
     */
    public function setStateId($stateId)
    {
        $this->stateId = $stateId;

        return $this;
    }

    /**
     * Get stateId
     *
     * @return string
     */
    public function getStateId()
    {
        return $this->stateId;
    }

    /**
     * Set county
     *
     * @param string $county
     * @return OpenEnrollmentSchool
     */
    public function setCounty($county)
    {
        $this->county = $county;

        return $this;
    }

    /**
     * Get county
     *
     * @return string
     */
    public function getCounty()
    {
        return $this->county;
    }

    /**
     * Set districtName
     *
     * @param string $districtName
     * @return OpenEnrollmentSchool
     */
    public function setDistrictName($districtName)
    {
        $this->districtName = $districtName;

        return $this;
    }

    /**
     * Get districtName
     *
     * @return string
     */
    public function getDistrictName()
    {
        return $this->districtName;
    }

    /**
     * Set listOfSchools
     *
     * @param string $listOfSchools
     * @return OpenEnrollmentSchool
     */
    public function setListOfSchools($listOfSchools)
    {
        $this->listOfSchools = $listOfSchools;

        return $this;
    }

    /**
     * Get listOfSchools
     *
     * @return string
     */
    public function getListOfSchools()
    {
        return $this->listOfSchools;
    }
}
