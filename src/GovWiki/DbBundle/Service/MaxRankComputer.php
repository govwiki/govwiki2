<?php

namespace GovWiki\DbBundle\Service;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\MaxRank;
use GovWiki\DbBundle\Entity\Repository\GovernmentRepository;

/**
 * Class MaxRankComputer
 * @package GovWiki\DbBundle\Service
 */
class MaxRankComputer
{
    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @param EntityManagerInterface $em A EntityManagerInterface instance.
     */
    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    /**
     * Compute and persist to database new max ranks values.
     *
     * @return MaxRankComputer
     */
    public function compute()
    {
        $altTypes = [
            'County',
            'City',
            'School District',
            'Special District',
        ];

        /** @var GovernmentRepository $repository */
        $repository = $this->em->getRepository('GovWikiDbBundle:Government');

        foreach ($altTypes as $type) {
            $data = $repository->computeMaxRanks($type);

            $maxRank = new MaxRank();
            $maxRank->setAltType($type);

            foreach ($data as $field => $value) {
                call_user_func([$maxRank, 'set' . ucfirst($field)], $value);
            }
            $this->em->persist($maxRank);
        }

        $this->em
            ->createQueryBuilder()
            ->delete()
            ->from('GovWikiDbBundle:MaxRank', 'MaxRank')
            ->getQuery()
            ->execute();
        $this->em->flush();

        return $this;
    }
}
