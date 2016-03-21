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
    public function getListLocales($environment)
    {
        if (null === $environment) {
            $qb = $this->createQueryBuilder('loc')
                ->select('loc')
                ->where('loc.environment IS NULL');
        } else {
            $qb = $this->createQueryBuilder('loc')
                ->select('loc')
                ->leftJoin('loc.environment', 'Environment')
                ->where('Environment.slug = :env')
                ->setParameter('env', $environment);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * @param string $environment Environment name.
     *
     * @return array
     */
    public function getListLocaleNames($environment)
    {
        if (null === $environment) {
            $qb = $this->createQueryBuilder('loc')
                ->select('loc.shortName')
                ->where('loc.environment IS NULL');
        } else {
            $qb = $this->createQueryBuilder('loc')
                ->select('loc.shortName')
                ->leftJoin('loc.environment', 'Environment')
                ->where('Environment.slug = :env')
                ->setParameter('env', $environment);
        }

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
        if (null === $environment) {
            $qb = $this->createQueryBuilder('loc')
                ->select('loc')
                ->where('loc.shortName = :shortName')
                ->andWhere('loc.environment is null')
                ->setParameter('shortName', $shortName)
                ->setMaxResults(1);
        } else {
            $qb = $this->createQueryBuilder('loc')
                ->select('loc')
                ->leftJoin('loc.environment', 'Environment')
                ->where('loc.shortName = :shortName')
                ->andWhere('Environment.slug = :env')
                ->setParameter('shortName', $shortName)
                ->setParameter('env', $environment)
                ->setMaxResults(1);
        }

        return $qb->getQuery()->getOneOrNullResult();
    }
}
