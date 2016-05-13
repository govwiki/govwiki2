<?php

namespace GovWiki\EnvironmentBundle\EventListener;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\EnvironmentBundle\Determinator\EnvironmentDeterminatorInterface;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;

/**
 * Class EnvironmentDeterminatorListener
 * @package GovWiki\EnvironmentBundle\EventListener
 */
class EnvironmentDeterminatorListener
{

    /**
     * @var EnvironmentDeterminatorInterface
     */
    private $determinator;

    /**
     * @var EnvironmentStorageInterface
     */
    private $environmentStorage;

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @param EnvironmentDeterminatorInterface $determinator       A EnvironmentDeterminatorInterface
     *                                                             instance.
     * @param EnvironmentStorageInterface      $environmentStorage A EnvironmentStorageInterface
     *                                                             instance.
     * @param EntityManagerInterface           $em                 A EntityManagerInterface
     *                                                             instance.
     */
    public function __construct(
        EnvironmentDeterminatorInterface $determinator,
        EnvironmentStorageInterface $environmentStorage,
        EntityManagerInterface $em
    ) {
        $this->determinator = $determinator;
        $this->environmentStorage = $environmentStorage;
        $this->em = $em;
    }

    /**
     * @param GetResponseEvent $event A GetResponseEvent instance.
     */
    public function onKernelRequest(GetResponseEvent $event)
    {
        $request = $event->getRequest();

        // Prevent determination if environment already setup.
        if ($this->environmentStorage->get()->getId() === -1) {
            $environment = $this->determinator->determine($request);
            $this->environmentStorage->set($environment);

            if ($environment !== null) {
                // Set site default locale.
                $defaultLocale = $environment
                    ->getDefaultLocale()
                    ->getShortName();

                $request->setLocale(
                    $request->getSession()->get('_locale', $defaultLocale)
                );
            }
        }
    }
}
