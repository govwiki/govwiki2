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
 * Translation repository class for the Doctrine ORM storage layer implementation.
 */
class LocaleRepository extends EntityRepository
{
    /**
     * @param string $environment Environment name.
     *
     * @return array
     */
    public function getListLocaleNames($environment)
    {
        $qb = $this->createQueryBuilder('loc')
            ->select('loc.shortName')
            ->leftJoin('loc.environment', 'Environment')
            ->where('Environment.slug = :env')
            ->setParameter('env', $environment)
        ;

        return $qb->getQuery()->getResult();
    }

    /**
     * @param string $environment Environment name.
     * @param string $shortName Locale shortName parameter.
     *
     * @return \GovWiki\DbBundle\Entity\Locale
     */
    public function getOneLocaleByShortName($environment, $shortName)
    {
        $qb = $this->createQueryBuilder('loc')
            ->select('loc')
            ->leftJoin('loc.environment', 'Environment')
            ->where('loc.shortName = :shortName')
            ->andWhere('Environment.slug = :env')
            ->setParameter('shortName', $shortName)
            ->setParameter('env', $environment)
            ->setMaxResults(1);
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }
}
