<?php
/*
 * This file is part of the AsmTranslationLoaderBundle package.
 *
 * (c) Marc Aschmann <maschmann@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace GovWiki\DbBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * EmailMessage repository class for the Doctrine ORM storage layer implementation.
 */
class EmailMessageRepository extends EntityRepository
{
    /**
     * @return array
     */
    public function getNotSentEmailMessages()
    {
        $qb = $this->createQueryBuilder('EmailMessage')
            ->select('EmailMessage')
            ->where('EmailMessage.error = :errorValue')
            ->orWhere('EmailMessage.error IS NULL')
            ->setParameter('errorValue', '');

        return $qb->getQuery()->getResult();
    }
}
