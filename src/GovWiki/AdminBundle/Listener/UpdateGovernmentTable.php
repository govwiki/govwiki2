<?php

namespace GovWiki\AdminBundle\Listener;

use Doctrine\Common\EventSubscriber;
use Doctrine\Common\Persistence\Event\LifecycleEventArgs;
use Doctrine\ORM\Events;
use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\DbBundle\Entity\Format;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class UpdateGovernmentTable
 * @package GovWiki\AdminBundle\Listener
 */
class UpdateGovernmentTable implements EventSubscriber
{
    /**
     * @var ContainerInterface
     */
    private $container;

    /**
     * @param ContainerInterface $container A ContainerInterface instance.
     */
    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    /**
     * {@inheritdoc}
     */
    public function getSubscribedEvents()
    {
        return [
            Events::postPersist,
            Events::postRemove,
        ];
    }

    /**
     * @param LifecycleEventArgs $event A LifecycleEventArgs instance.
     *
     * @return void
     */
    public function postPersist(LifecycleEventArgs $event)
    {
        $entity = $event->getObject();

        if ($entity instanceof Format) {
            /*
             * Add new column to government table.
             */
            $manager = $this->container
                ->get(GovWikiAdminServices::ADMIN_ENVIRONMENT_MANAGER);

            $manager
                ->addColumnToGovernment(
                $entity->getField(),
                $entity->getType()
            );

            if ($entity->isRanked()) {
                $manager->addColumnToGovernment(
                    $entity->getField().'_rank',
                    'integer'
                );
            }
        }
    }

    /**
     * @param LifecycleEventArgs $event A LifecycleEventArgs instance.
     *
     * @return void
     */
    public function postRemove(LifecycleEventArgs $event)
    {
        $entity = $event->getObject();

        if ($entity instanceof Format) {
            /*
             * Remove column from government table.
             */
            $manager = $this->container
                ->get(GovWikiAdminServices::ADMIN_ENVIRONMENT_MANAGER);

            $manager
                ->deleteColumnFromGovernment($entity->getField());
            if ($entity->isRanked()) {
                $manager->deleteColumnFromGovernment(
                    $entity->getField(). '_rank'
                );
            }
        }
    }
}
