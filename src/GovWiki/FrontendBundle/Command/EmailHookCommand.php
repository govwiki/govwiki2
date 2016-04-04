<?php

namespace GovWiki\FrontendBundle\Command;

use GovWiki\UserBundle\Entity\User;
use GovWiki\UserBundle\Service\ChatMessage;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * EmailHookCommand
 */
class EmailHookCommand extends ContainerAwareCommand
{
    /**
     *{@inheritdoc}
     */
    protected function configure()
    {
        $this
            ->setName('govwiki:hook')
            ->setDescription('Receive data from email server (read STDIN) and create new chat message');
    }

    /**
     *{@inheritdoc}
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $fData = fopen('php://stdin', 'r');
        $logger = $this->getContainer()->get('logger');

        $from = null;
        $isMessageBegin = false;
        $message = '';

        $logger->addInfo('Got email message.');

        /*
         * Process stream and fetch email 'From:' field and email message body.
         */
        while (! feof($fData)) {
            // Get string from stream.
            $buf = fgets($fData);

            // Find 'From:' in buffer.
            $fromIdx = strpos($buf, 'From:');

            if ((false !== $fromIdx) && (! $isMessageBegin)) {
                // Fetch sender email.
                $from = preg_replace('/.*?(\w+@\w+\.\w+).*/', '$1', $from);
            } elseif ($from) {
                if ($isMessageBegin) {
                    // Collect message.
                    $message .= $buf;
                } elseif (PHP_EOL === $buf) {
                    // Empty line separates body from header.
                    $isMessageBegin = true;
                }
            }
        }
        fclose($fData);

        if ($from && $message) {
            /*
             * Persist new message.
             */
            $em = $this->getContainer()
                ->get('doctrine.orm.default_entity_manager');
            $logger->addInfo('Email from: '. $from);

            // Get user with specified email.
            /** @var User $user */
            $user = $this->getContainer()
                ->get('fos_user.user_manager')
                ->findUserByEmail($from);

            if (! $user) {
                $logger->addError('Can\'t find sender in database');
                return -1;
            }

            // Get government and chat.
            $government = $em
                ->getRepository('GovWikiDbBundle:Government')
                ->getWithChatBySubscriber($user->getId());
            if (! $government) {
                $logger->addError('This user has not signed to any government.');
                return -1;
            }
            $chat = $government->getChat();

            /** @var ChatMessage $chatMessageService */
            $chatMessageService = $this->getContainer()
                ->get('govwiki.user_bundle.chat_message');

            // Get all subscribers emails.
            $emailList = $chatMessageService
                ->getChatMessageReceiversEmailList(
                    $chat,
                    $government,
                    $from,
                    $user->isAdmin()
                );

            // Get all subscribers phones.
            $phoneList = $chatMessageService
                ->getChatMessageReceiversPhonesList(
                    $chat,
                    $government,
                    $user->getPhone()
                );

            $chatMessageService->persistEmailMessages(
                $emailList,
                $from,
                $government->getName(),
                [
                    'government_name' => $government->getName(),
                    'author' => $user->getUsername(),
                    'message_text' => $message,
                ]
            );

            $chatMessageService->persistTwilioSmsMessages(
                $phoneList,
                $user->getPhone(),
                $message
            );

            $logger->addInfo('Message persisted');
            $em->flush();
        } else {
            $logger->addAlert('Can\'t fetch sender email and message');
        }

        return 0;
    }
}
