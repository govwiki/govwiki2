<?php

namespace GovWiki\DbBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\LockHandler;
use GovWiki\DbBundle\Entity\TwilioSmsMessages;

/**
 * Class SendTwilioCommand
 * @package DbBundle\Command
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
        $messages = $em->getRepository('GovWikiDbBundle:TwilioSmsMessages')->getNotSentTwilioSmsMessages();
        $twilio = $this->getContainer()->get('twilio.api');

        /** @var TwilioSmsMessages $message */
        foreach ($messages as $message) {
            try {
                $twilio->account->messages->sendMessage(
                    $this->getContainer()->getParameter('twilio.from'),
                    $message->getToNumber(),
                    $message->getMessage()
                );
                $em->remove($message);
            } catch (\Services_Twilio_RestException $e) {
                $message->setError($e->getMessage());
            }
        }

        $em->flush();

        return true;
    }
}
