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
 * TwilioSmsMessages repository class for the Doctrine ORM storage layer implementation.
 */
class TwilioSmsMessagesRepository extends EntityRepository
{
    /**
     * @return array
     */
    public function getNotSentTwilioSmsMessages()
    {
        $qb = $this->createQueryBuilder('TwilioSms')
            ->select('TwilioSms')
            ->where('TwilioSms.error = :errorValue')
            ->orWhere('TwilioSms.error IS NULL')
            ->setParameter('errorValue', '');

        return $qb->getQuery()->getResult();
    }
}
