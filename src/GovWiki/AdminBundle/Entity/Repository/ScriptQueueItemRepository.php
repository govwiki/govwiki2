<?php

namespace GovWiki\AdminBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use GovWiki\AdminBundle\Entity\Script;
use GovWiki\AdminBundle\Entity\ScriptQueueItem;

/**
 * Class ScriptQueueItemRepository
 *
 * @package GovWiki\AdminBundle\Entity\Repository
 */
class ScriptQueueItemRepository extends EntityRepository
{

    /**
     * @param integer $count Requested number of pulled items.
     *
     * @return ScriptQueueItem[]
     */
    public function pull(int $count): array
    {
        if ($count <= 0) {
            throw new \InvalidArgumentException(\sprintf(
                'Requested number of pulled items should be greater than 0, %d given',
                $count
            ));
        }

        $items = $this->createQueryBuilder('ScriptQueueItem')
            ->orderBy('ScriptQueueItem.id', 'desc')
            ->setMaxResults($count)
            ->select('ScriptQueueItem, Script')
            ->join('ScriptQueueItem.script', 'Script')
            ->getQuery()
            ->getResult();

        $this->createQueryBuilder('ScriptQueueItem')
            ->delete()
            ->where('ScriptQueueItem.id IN (:ids)')
            ->setParameter('ids', \array_map(function (ScriptQueueItem $item) {
                return $item->getId();
            }, $items))
            ->getQuery()
            ->execute();

        return $items;
    }

    /**
     * @param Script $script A queued item.
     *
     * @return void
     */
    public function push(Script $script)
    {
        $this->createQueryBuilder('ScriptQueueItem')
            ->delete()
            ->where('ScriptQueueItem.script = :scriptId')
            ->setParameter('scriptId', $script->getId())
            ->getQuery()
            ->execute();

        $queuedItem = new ScriptQueueItem($script);

        $this->_em->persist($queuedItem);
        $this->_em->flush($queuedItem);
    }
}
