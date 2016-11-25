<?php

namespace GovWiki\EnvironmentBundle\Utils;

use React\EventLoop\LoopInterface;
use React\EventLoop\Timer\TimerInterface;
use React\Promise\Deferred;
use React\Stream\Stream;

/**
 * Class RSSReader
 * @package GovWiki\EnvironmentBundle\Utils
 */
class RSSReader
{

    /**
     * @var string
     */
    private $url;

    /**
     * @var LoopInterface
     */
    private $loop;

    /**
     * @param string        $url  XML file url.
     * @param LoopInterface $loop A React LoopInterface instance.
     */
    public function __construct($url, LoopInterface $loop)
    {
        $this->url = $url;
        $this->loop = $loop;
    }

    /**
     * @return \React\Promise\Promise
     */
    public function read()
    {
        $deferred = new Deferred();
        $handler = function (TimerInterface $timer) use ($deferred) {
            $tmp = '';

            $xmlFile = fopen($this->url, 'r');
            stream_set_blocking($xmlFile, false);

            $read = new Stream($xmlFile, $this->loop);
            $read->on('data', function ($data) use (&$tmp) {
                $tmp .= $data;
            });

            $read->on('end', function () use (&$tmp, $deferred, $timer) {
                try {
                    $parser = new XMLParser();

                    $deferred->resolve($parser->parse($tmp));
                    $timer->cancel();
                } catch (\Exception $e) {
                    $deferred->reject($e->getMessage());
                }

                $tmp = '';
            });
        };


        $this->loop->addPeriodicTimer(1, $handler);
        return $deferred->promise();
    }
}
