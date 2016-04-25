<?php

namespace GovWiki\EnvironmentBundle\EventListener;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\EnvironmentBundle\Determinator\EnvironmentDeterminatorInterface;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use Symfony\Component\HttpFoundation\Session\Session;
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
     * @var Session
     */
    private $session;

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * todo remove session when new admin interface complete.
     *
     * @param EnvironmentDeterminatorInterface $determinator       A
     *                                                             EnvironmentDeterminatorInterface
     *                                                             instance.
     * @param EnvironmentStorageInterface      $environmentStorage A
     *                                                             EnvironmentStorageInterface
     *                                                             instance.
     * @param Session                          $session            A Session
     *                                                             instance.
     */
    public function __construct(
        EnvironmentDeterminatorInterface $determinator,
        EnvironmentStorageInterface $environmentStorage,
        Session $session,
        EntityManagerInterface $em
    ) {
        $this->determinator = $determinator;
        $this->environmentStorage = $environmentStorage;
        $this->session = $session;
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
            $environment = null;

            // Try to get from session (only for admin)
            // todo remove when new admin interface complete.
            if (strpos($request->getBasePath(), 'admin')) {
                $environment = $this->session->get('environment', null);
                if ($environment !== null) {
                    $environment = $this->em->getRepository('GovWikiDbBundle:Environment')
                        ->getBySlug($environment);
                }
            }

            if ($environment === null) {
                $environment = $this->determinator->determine($request);
                $this->environmentStorage->set($environment);
            }

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
