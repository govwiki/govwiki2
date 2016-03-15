<?php

namespace GovWiki\ApiBundle\TwilioApi;

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
     * Set api keys
     *
     * @param string $sid
     * @param string $token
     * @param string $from
     */
    public function __construct($sid, $token, $from)
    {
        $this->sid   = $sid;
        $this->token = $token;
        $this->from  = $from;
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
}
