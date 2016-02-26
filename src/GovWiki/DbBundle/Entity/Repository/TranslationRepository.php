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
class TranslationRepository extends EntityRepository
{
    /**
     * @param string $environment Environment name.
     * @param string $locale_name Locale short name ('en', 'fr' etc.)
     * @param array $trans_key_settings Array with Matching type and Translation Keys array
     * @param string $translation Translation text
     * @param boolean $needOneResult If true, return object, else return array.
     *
     * @return array
     */
    public function getTranslationsBySettings($environment, $locale_name = null, $trans_key_settings = null, $translation = null, $needOneResult = null)
    {
        $qb = $this->createQueryBuilder('tr')
            ->select('tr')
            ->leftJoin('tr.locale', 'Locale')
            ->leftJoin('Locale.environment', 'Environment')
            ->where('Environment.slug = :env')
            ->setParameter('env', $environment)
        ;

        $expr = $qb->expr();

        if (null !== $locale_name) {
            $qb->andWhere('Locale.shortName = :locale_name')
                ->setParameter('locale_name', $locale_name);
        }

        if (null !== $trans_key_settings) {
            $matching = $trans_key_settings['matching'];
            $trans_keys = $trans_key_settings['transKeys'];

            if (!empty($trans_keys)) {
                if ('eq' == $matching) {
                    $qb->andWhere($expr->in('tr.transKey', ':transKeysArray'))
                        ->setParameter('transKeysArray', $trans_keys);
                } elseif ('like' == $matching) {
                    $orX = $expr->orX();
                    foreach ($trans_keys as $trans_key) {
                        $orX->add('tr.transKey LIKE ' . $expr->literal('%' . $trans_key . '%'));
                    }
                    $qb->andWhere($orX);
                }
            }
        }

        if (null !== $translation) {
            $qb->andWhere($expr->like(
                'tr.translation',
                $expr->literal('%' . $translation . '%')
            ));
        }

        if (null !== $needOneResult) {
            $qb->setMaxResults(1);
            return $qb->getQuery()->getOneOrNullResult();
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * @param string $environment Environment name.
     * @param string $locale_name Locale short name ('en', 'fr' etc.)
     *
     * @return array
     */
    public function getTransInfoByLocale($environment, $locale_name)
    {
        $qb = $this->createQueryBuilder('tr')
            ->select('tr.transKey, tr.translation, tr.transTextareaType')
            ->leftJoin('tr.locale', 'Locale')
            ->leftJoin('Locale.environment', 'Environment')
            ->where('Locale.shortName = :locale_name')
            ->andWhere('Environment.slug = :env')
            ->setParameter('locale_name', $locale_name)
            ->setParameter('env', $environment)
        ;

        return $qb->getQuery()->getResult();
    }
}
