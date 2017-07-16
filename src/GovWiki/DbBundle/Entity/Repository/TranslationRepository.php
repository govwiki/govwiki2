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
     * @param integer $environment A Environment entity id.
     * @param string  $locale      Locale short name.
     *
     * @return array
     */
    public function getAllTranslations($environment, $locale)
    {
        $expr = $this->_em->getExpressionBuilder();

        $globalLocaleDQL = $this->_em->createQueryBuilder()
            ->select('GlobalLocale.id')
            ->from('GovWikiDbBundle:GlobalLocale', 'GlobalLocale')
            ->where($expr->eq('GlobalLocale.shortName', ':locale'))
            ->getDQL();

        return $this->createQueryBuilder('tr')
            ->select('tr.transKey, tr.translation')
            ->leftJoin('tr.locale', 'Locale')
            ->where($expr->orX(
                $expr->andX(
                    $expr->eq('Locale.shortName', ':locale'),
                    $expr->eq('Locale.environment', ':environment')
                ),
                $expr->in('Locale', $globalLocaleDQL)
            ))
            ->setParameters([
                'environment' => $environment,
                'locale' => $locale,
            ])
            ->getQuery()
            ->getResult();
    }

    /**
     * @param integer $environment   Environment entity id.
     * @param string  $locale        Locale short name ('en', 'fr' etc.).
     * @param array   $keySettings   Array with Matching type and
     *                               Translation Keys array
     * @param string  $translation   Translation text.
     * @param boolean $needOneResult If true, return object, else return
     *                               array.
     *
     * @return array
     */
    public function getEnvironmentTranslations(
        $environment,
        $locale,
        $keySettings = null,
        $translation = null,
        $needOneResult = false
    ) {
        $expr = $this->_em->getExpressionBuilder();

        $qb = $this->createQueryBuilder('tr')
            ->select('tr')
            ->leftJoin('tr.locale', 'Locale')
            ->where($expr->andX(
                $expr->eq('Locale.shortName', ':locale'),
                $expr->eq('Locale.environment', ':environment')
            ))
            ->setParameters([
                'environment' => $environment,
                'locale' => $locale,
            ]);

        if (is_array($keySettings) && (count($keySettings) > 0)) {
            $matching = $keySettings['matching'];
            $keys = $keySettings['transKeys'];

            if (! empty($keys)) {
                if ('eq' === $matching) {
                    $qb->andWhere($expr->in('tr.transKey', ':transKeysArray'))
                        ->setParameter('transKeysArray', $keys);
                } elseif ('like' === $matching) {
                    $orX = $expr->orX();
                    foreach ($keys as $key) {
                        $orX->add('tr.transKey LIKE ' .
                            $expr->literal('%' . $key . '%')
                        );
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

        if ($needOneResult) {
            $qb->setMaxResults(1);

            return $qb->getQuery()->getOneOrNullResult();
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * @param string  $locale        Locale short name ('en', 'fr' etc.).
     * @param array   $keySettings   Array with Matching type and
     *                               Translation Keys array
     * @param string  $translation   Translation text.
     * @param boolean $needOneResult If true, return object, else return
     *                               array.
     *
     * @return array
     */
    public function getGlobalTranslations(
        $locale,
        $keySettings = null,
        $translation = null,
        $needOneResult = false
    ) {
        $expr = $this->_em->getExpressionBuilder();

        $globalLocaleDQL = $this->_em->createQueryBuilder()
            ->select('GlobalLocale')
            ->from('GovWikiDbBundle:GlobalLocale', 'GlobalLocale')
            ->where($expr->eq('GlobalLocale.shortName', ':locale'))
            ->getDQL();

        $qb = $this->createQueryBuilder('tr')
            ->select('tr')
            ->leftJoin('tr.locale', 'Locale')
            ->where($expr->in('Locale', $globalLocaleDQL))
            ->setParameter('locale', $locale);

        if ($keySettings !== null) {
            $matching = $keySettings['matching'];
            $keys = $keySettings['transKeys'];

            if (! empty($keys)) {
                if ('eq' === $matching) {
                    $qb->andWhere($expr->in('tr.transKey', ':transKeysArray'))
                        ->setParameter('transKeysArray', $keys);
                } elseif ('like' === $matching) {
                    $orX = $expr->orX();
                    foreach ($keys as $key) {
                        $orX->add('tr.transKey LIKE ' .
                            $expr->literal('%' . $key . '%')
                        );
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

        if ($needOneResult) {
            $qb->setMaxResults(1);

            return $qb->getQuery()->getOneOrNullResult();
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * @param integer $environment        Environment entity id.
     * @param string  $locale_name        Locale short name ('en', 'fr' etc.)
     * @param array   $trans_key_settings Array with Matching type and
     *                                    Translation Keys array
     * @param string  $translation        Translation text
     * @param boolean $needOneResult      If true, return object, else return
     *                                    array.
     *
     * @return array
     */
    public function getTranslationsBySettings(
        $environment,
        $locale_name,
        $trans_key_settings = null,
        $translation = null,
        $needOneResult = null
    ) {
        $expr = $this->_em->getExpressionBuilder();
        $added = false;
        $noMerge = ($trans_key_settings !== null) && array_key_exists('no_merge', $trans_key_settings)
            && $trans_key_settings['no_merge'] === true;

        $qb = $this->createQueryBuilder('tr')
            ->select('tr')
            ->leftJoin('tr.locale', 'Locale');

        if (null !== $environment) {
            $qb
                ->where($expr->andX(
                    $expr->eq('Locale.shortName', ':locale_name'),
                    $expr->eq('Locale.environment', ':env')
                ))
                ->setParameters([
                    'env' => $environment,
                    'locale_name' => $locale_name,
                ]);
        } else {
            $globalLocaleDQL = $this->_em->createQueryBuilder()
                ->select('GlobalLocale')
                ->from('GovWikiDbBundle:GlobalLocale', 'GlobalLocale')
                ->where($expr->eq('GlobalLocale.shortName', ':locale_name'))
                ->getDQL();
            $qb->orWhere($expr->in('Locale', $globalLocaleDQL));
            $qb->setParameter('locale_name', $locale_name);
            $added = true;
        }

        if ((null !== $trans_key_settings) && array_key_exists('matching', $trans_key_settings)) {
            $matching = $trans_key_settings['matching'];
            $trans_keys = $trans_key_settings['transKeys'];

            if (!empty($trans_keys)) {
                if ('eq' === $matching) {
                    $qb->andWhere($expr->in('tr.transKey', ':transKeysArray'))
                        ->setParameter('transKeysArray', $trans_keys);
                } elseif ('like' === $matching) {
                    $orX = $expr->orX();
                    foreach ($trans_keys as $trans_key) {
                        $orX->add('tr.transKey LIKE ' . $expr->literal('%' . $trans_key . '%'));
                    }
                    $qb->andWhere($orX);
                }
            }
        } elseif ((false === $added) && ! $noMerge) {
            $globalLocaleDQL = $this->_em->createQueryBuilder()
                ->select('GlobalLocale')
                ->from('GovWikiDbBundle:GlobalLocale', 'GlobalLocale')
                ->where($expr->eq('GlobalLocale.shortName', ':locale_name'))
                ->setParameter('locale_name', $locale_name)
                ->getDQL();
            $qb->orWhere($expr->in('Locale', $globalLocaleDQL));
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
        if (null === $environment) {
            $qb = $this->createQueryBuilder('tr')
                ->select('tr.transKey, tr.translation, tr.transTextareaType')
                ->leftJoin('tr.locale', 'Locale')
                ->where('Locale.shortName = :locale_name')
                ->andWhere('Locale.environment is null')
                ->setParameter('locale_name', $locale_name);
        } else {
            $qb = $this->createQueryBuilder('tr')
                ->select('tr.transKey, tr.translation, tr.transTextareaType')
                ->leftJoin('tr.locale', 'Locale')
                ->leftJoin('Locale.environment', 'Environment')
                ->where('Locale.shortName = :locale_name')
                ->andWhere('Environment.slug = :env')
                ->setParameter('locale_name', $locale_name)
                ->setParameter('env', $environment);
        }

        return $qb->getQuery()->getResult();
    }
}
