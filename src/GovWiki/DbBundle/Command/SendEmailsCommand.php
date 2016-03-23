<?php

namespace GovWiki\DbBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\LockHandler;
use GovWiki\DbBundle\Entity\EmailMessage;

/**
 * Class SendEmailsCommand
 * @package DbBundle\Command
 */
class SendEmailsCommand extends ContainerAwareCommand
{
    /**
     * Configure
     */
    protected function configure()
    {
        $this
            ->setName('emails:send')
            ->setDescription('Send email messages from DB (email_messages)');
    }

    /**
     * @param InputInterface  $input
     * @param OutputInterface $output
     * @return int
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $lock = new LockHandler('emails:send');
        if (!$lock->lock()) {
            $output->writeln('This command is already running in another process.');

            return false;
        }

        $em = $this->getContainer()->get('doctrine.orm.entity_manager');
        $email_messages = $em->getRepository('GovWikiDbBundle:EmailMessage')->getNotSentEmailMessages();

        /** @var EmailMessage $message_entity */
        foreach ($email_messages as $message_entity) {
            try {
                $swift_message = \Swift_Message::newInstance(
                    $message_entity->getSubject(),
                    $message_entity->getMessage(),
                    'text/html'
                );
                $swift_message
                    ->setSender($message_entity->getFromEmail())
                    ->setTo($message_entity->getToEmail());

                $failed = [];
                $this->getContainer()->get('mailer')->send($swift_message, $failed);

                $em->remove($message_entity);
            } catch (\Services_Twilio_RestException $e) {
                $message_entity->setError($e->getMessage());
            }
        }

        $em->flush();

        return true;
    }
}
