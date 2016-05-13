<?php

namespace GovWiki\AdminBundle\Listener;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\AdminBundle\Controller\AbstractGovWikiAdminController;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use Symfony\Component\HttpKernel\Event\FilterControllerEvent;

/**
 * Class EnvironmentListener
 * @package GovWiki\AdminBundle\Listener
 */
class EnvironmentListener
{
    /**
     * @var EnvironmentStorageInterface
     */
    private $storage;

    /**
     * @param EntityManagerInterface      $em      A EntityManagerInterface
     *                                             instance.
     * @param EnvironmentStorageInterface $storage A EnvironmentStorageInterface
     *                                             instance.
     */
    public function __construct(
        EntityManagerInterface $em,
        EnvironmentStorageInterface $storage
    ) {
        $this->em = $em;
        $this->storage = $storage;
    }

    /**
     * @param FilterControllerEvent $event A FilterControllerEvent instance.
     *
     * @return void
     */
    public function onKernelController(FilterControllerEvent $event)
    {
        $controller = $event->getController();
        if (is_array($controller) &&
            ($controller[0] instanceof AbstractGovWikiAdminController)) {
            $attr = $event->getRequest()->attributes->get('environment');

            if ($attr === null) {
                // Remove environment.
                $this->storage->set(null);
            } else {
                $repository = $this->em
                    ->getRepository('GovWikiDbBundle:Environment');

                if (is_numeric($attr)) {
                    $this->storage->set($repository->findOneBy([ 'id' => $attr ]));
                } else {
                    $this->storage->set($repository->findOneBy([ 'slug' => $attr ]));
                }
            }
        }
    }
}
