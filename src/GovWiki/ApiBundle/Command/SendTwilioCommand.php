<?php

namespace GovWiki\ApiBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\LockHandler;
use GovWiki\DbBundle\Entity\TwilioSmsMessages;

/**
 * Class SendTwilioCommand
 * @package ApiBundle\Command
 */
class SendTwilioCommand extends ContainerAwareCommand
{
    /**
     * Configure
     */
    protected function configure()
    {
        $this
            ->setName('twilio:send')
            ->setDescription('Send twilio messages from DB (twilio_sms_messages)');
    }

    /**
     * @param InputInterface  $input
     * @param OutputInterface $output
     * @return int
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $lock = new LockHandler('twilio:send');
        if (!$lock->lock()) {
            $output->writeln('This command is already running in another process.');

            return false;
        }

        $em = $this->getContainer()->get('doctrine.orm.entity_manager');
        $messages = $em->createQuery(
            'SELECT sms FROM GovWikiDbBundle:TwilioSmsMessages sms WHERE sms.error = :errorValue OR sms.error IS NULL'
        )
           ->setParameters(
               [
                   'errorValue'  => '',
               ]
           )->getResult();

        $twilioService = $this->getContainer()->get('govwiki.api.twilio');
        /* @var $message TwilioSmsMessages */
        foreach ($messages as $message) {
            $result = $twilioService->sendMessageToOneNumbers(
                $message->getFromNumber(),
                $message->getToNumber(),
                $message->getMessage()
            );

            if ($result['error']) {
                $message->setError($result['message']);
            } else {
                $em->remove($message);
            }

            $em->flush();
        }

        return true;
    }
}
