<?php

namespace GovWiki\ApiBundle\TwilioApi;

use GovWiki\DbBundle\Entity\TwilioSmsMessages;

require_once(__DIR__.'/Services/Twilio.php');

/**
 * Twilio service
 */
class TwilioService
{
    /**
     * @var string
     */
    private $sid;

    /**
     * @var string
     */
    private $token;

    /**
     * @var string
     */
    private $from;

    /**
     * @var string
     */
    private $errorMessage;

    /**
     * @var array
     */
    private $details;

    /**
     * @var object
     */
    private $doctrine;

    /**
     * Set api keys
     *
     * @param string $sid
     * @param string $token
     * @param string $from
     * @param object $doctrine
     */
    public function __construct($sid, $token, $from, $doctrine)
    {
        $this->sid      = $sid;
        $this->token    = $token;
        $this->from     = $from;
        $this->doctrine = $doctrine;
    }

    /**
     * Send message to users by Twilio
     *
     * @param array  $toNumbers
     * @param string $message
     */
    public function sendMessageToNumbers($toNumbers, $message)
    {
        $client = new \Services_Twilio($this->sid, $this->token);

        foreach ($toNumbers as $to) {
            try {
                $client->account->messages->sendMessage(
                    $this->from,
                    $to,
                    $message
                );

                $this->details[$to] = [
                    'error'   => false,
                    'message' => 'success sent.',
                ];
            } catch (\Services_Twilio_RestException $e) {
                $this->errorMessage = $e->getMessage();
                $this->details[$to] = [
                    'error'   => true,
                    'message' => $e->getMessage(),
                ];
            }
        }
    }

    /**
     * Send message to one number by Twilio
     *
     * @param string $from
     * @param string $to
     * @param string $message
     * @return array
     */
    public function sendMessageToOneNumbers($from, $to, $message)
    {
        $client = new \Services_Twilio($this->sid, $this->token);

        try {
            $client->account->messages->sendMessage(
                $from,
                $to,
                $message
            );
        } catch (\Services_Twilio_RestException $e) {
            return [
                'error'   => true,
                'message' => $e->getMessage(),
            ];
        }

        return [
            'error'   => false,
            'message' => 'Success sent',
        ];
    }

    /**
     * Check errors
     *
     * @return bool|string
     */
    public function isError()
    {
        if ($this->errorMessage) {
            return $this->errorMessage;
        }

        return false;
    }

    /**
     * Get detail info by numbers
     *
     * @return array
     */
    public function getDetails()
    {
        return $this->details;
    }

    /**
     * Save message to database for next distribution
     *
     * @param array  $toNumbers
     * @param string $message
     */
    public function saveMessagesToBaseForDistribution($toNumbers, $message)
    {
        $em = $this->doctrine->getManager();

        foreach ($toNumbers as $to) {
            $smsMessage = new TwilioSmsMessages();
            $smsMessage->setFromNumber($this->from);
            $smsMessage->setToNumber($to);
            $smsMessage->setMessage($message);
            $em->persist($smsMessage);
        }

        $em->flush();
    }
}
