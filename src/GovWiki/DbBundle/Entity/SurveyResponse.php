<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * SurveyResponse
 *
 * @ORM\Table(name="survey_responses")
 * @ORM\Entity(repositoryClass="GovWiki\DbBundle\Entity\Repository\SurveyResponseRepository")
 */
class SurveyResponse
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
     * @var array
     *
     * @ORM\Column(name="responses", type="array")
     */
    private $responses;

    /**
     * @var string
     *
     * @ORM\ManyToOne(targetEntity="Survey", inversedBy="responses")
     */
    private $survey;

    /**
     * @var ElectedOfficial
     *
     * @ORM\ManyToOne(targetEntity="ElectedOfficial", inversedBy="surveyResponses")
     */
    private $electedOfficial;


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
     * Set responses
     *
     * @param array $responses Response from elected.
     *
     * @return SurveyResponse
     */
    public function setResponses(array $responses)
    {
        $this->responses = $responses;

        return $this;
    }

    /**
     * Get responses
     *
     * @return array
     */
    public function getResponses()
    {
        return $this->responses;
    }

    /**
     * Set electedOfficial
     *
     * @param ElectedOfficial $electedOfficial A ElectedOfficial entity instance.
     *
     * @return SurveyResponse
     */
    public function setElectedOfficial(ElectedOfficial $electedOfficial = null)
    {
        $this->electedOfficial = $electedOfficial;

        return $this;
    }

    /**
     * Get electedOfficial
     *
     * @return ElectedOfficial
     */
    public function getElectedOfficial()
    {
        return $this->electedOfficial;
    }

    /**
     * Set survey
     *
     * @param Survey $survey A Survey entity instance.
     *
     * @return SurveyResponse
     */
    public function setSurvey(Survey $survey = null)
    {
        $this->survey = $survey;

        return $this;
    }

    /**
     * Get survey
     *
     * @return Survey
     */
    public function getSurvey()
    {
        return $this->survey;
    }
}
