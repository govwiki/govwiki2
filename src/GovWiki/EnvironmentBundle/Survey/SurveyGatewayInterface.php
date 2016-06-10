<?php

namespace GovWiki\EnvironmentBundle\Survey;

/**
 * Interface SurveyGatewayInterface
 * @package GovWiki\EnvironmentBundle\Survey
 */
interface SurveyGatewayInterface
{
    /**
     * Get list of surveys.
     *
     * @return array
     */
    public function getList();

    /**
     * Get survey details.
     *
     * @param string $surveyId Survey ID from SurveyMonkey.
     *
     * @return array
     */
    public function getDetails($surveyId);
}
