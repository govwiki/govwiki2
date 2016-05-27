<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Survey
 *
 * @ORM\Table(name="surveys")
 * @ORM\Entity
 */
class Survey
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
    private $title;

    /**
     * @var string
     *
     * @ORM\Column(name="survey_id", type="string", length=255)
     */
    private $surveyId;

    /**
     * @var Collection
     *
     * @ORM\OneToMany(targetEntity="SurveyResponse", mappedBy="survey")
     */
    private $responses;

    /**
     * @var array
     *
     * @ORM\Column(type="array")
     */
    private $altTypes = [];

    /**
     * @var Environment
     *
     * @ORM\ManyToOne(targetEntity="Environment")
     */
    private $environment;


    /**
     * Constructor
     */
    public function __construct()
    {
        $this->responses = new ArrayCollection();
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
     * Set surveyId
     *
     * @param string $surveyId Survey id from remote service.
     *
     * @return SurveyResponse
     */
    public function setSurveyId($surveyId)
    {
        $this->surveyId = $surveyId;

        return $this;
    }

    /**
     * Get surveyId
     *
     * @return string
     */
    public function getSurveyId()
    {
        return $this->surveyId;
    }

    /**
     * Add responses
     *
     * @param SurveyResponse $responses A SurveyResponse entity instance.
     *
     * @return Survey
     */
    public function addResponse(SurveyResponse $responses)
    {
        $this->responses[] = $responses;

        return $this;
    }

    /**
     * Remove responses
     *
     * @param SurveyResponse $responses A SurveyResponse entity instance.
     *
     * @return Survey
     */
    public function removeResponse(SurveyResponse $responses)
    {
        $this->responses->removeElement($responses);

        return $this;
    }

    /**
     * Get responses
     *
     * @return Collection
     */
    public function getResponses()
    {
        return $this->responses;
    }

    /**
     * Set altTypes
     *
     * @param array $altTypes Survey alt types.
     *
     * @return Survey
     */
    public function setAltTypes(array $altTypes)
    {
        $this->altTypes = $altTypes;

        return $this;
    }

    /**
     * Get altTypes
     *
     * @return array
     */
    public function getAltTypes()
    {
        return $this->altTypes;
    }

    /**
     * Set environment
     *
     * @param Environment $environment A Environment entity id.
     *
     * @return Survey
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

    /**
     * Set title
     *
     * @param string $title Survey title.
     *
     * @return Survey
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * Get title
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }
}
