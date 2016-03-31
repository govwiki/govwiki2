<?php

namespace GovWiki\FrontendBundle\Command;

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

        /*
         * Process stream and fetch email 'From:' field and email message body.
         */
        while (! feof($fData)) {
            // Get string from stream.
            $buf = fgets($fData);

            // Find 'From:' in buffer.
            $fromIdx = strpos($buf, 'From:');

            if ((false !== $fromIdx) && (! $isMessageBegin)) {
                // Fetch 'from' mail field.

                $start = $fromIdx + 6; // length of 'From:' + one white space.
                $bracketIdx = strpos($buf, ' (');

                $from = substr(
                    $buf,
                    $start,
                    $bracketIdx - $start
                );
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
    }
}
