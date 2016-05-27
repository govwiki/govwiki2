<?php

namespace GovWiki\EnvironmentBundle\Survey\Gateway;

use Ascension\SurveyMonkey;
use GovWiki\EnvironmentBundle\Survey\SurveyGatewayInterface;

/**
 * Class SurveyMonkeyGateway
 *
 * Decorator under SurveyMonkey class.
 *
 * @package GovWiki\EnvironmentBundle\Manager\Survey\Gateway
 */
class SurveyMonkeyGateway extends SurveyMonkey implements SurveyGatewayInterface
{

    /**
     * Get list of surveys.
     *
     * @return array
     */
    public function getList()
    {
        return $this->getSurveyList([ 'fields' => ['title'] ]);
    }


    /**
     * Get survey details.
     *
     * @param string $surveyId Survey ID from SurveyMonkey.
     *
     * @return array
     */
    public function getDetails($surveyId)
    {
        return $this->getSurveyDetails($surveyId);
    }
}
