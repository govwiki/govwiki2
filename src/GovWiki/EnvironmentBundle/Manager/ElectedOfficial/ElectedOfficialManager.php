<?php

namespace GovWiki\EnvironmentBundle\Manager\ElectedOfficial;

use Doctrine\DBAL\DBALException;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query\QueryException;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Entity\Repository\ElectedOfficialRepository;

/**
 * Class ElectedOfficialManager
 * @package GovWiki\EnvironmentBundle\ElectedOfficial
 */
class ElectedOfficialManager implements ElectedOfficialManagerInterface
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
     * {@inheritdoc}
     */
    public function computeElectedOfficialsCount(Environment $environment = null)
    {
        $expr = $this->em->getExpressionBuilder();
        try {
            return $this->em->createQueryBuilder()
                ->from('GovWikiDbBundle:ElectedOfficial', 'eo')
                ->select($expr->count('eo.id'))
                ->join('eo.government', 'Government')
                ->where($expr->eq('Government.environment', ':environment'))
                ->setParameter('environment', $environment->getId())
                ->getQuery()
                ->getSingleScalarResult();
        } catch (QueryException $e) {
            return 0;
        }
    }

    /**
     * {@inheritdoc}
     */
    public function searchElectedOfficial(Environment $environment, $partOfName)
    {
        /** @var ElectedOfficialRepository $repository */
        $repository = $this->em->getRepository('GovWikiDbBundle:ElectedOfficial');

        return $repository->search($environment->getId(), $partOfName);
    }

    /**
     * {@inheritdoc}
     */
    public function getElectedOfficial(
        Environment $environment,
        $altTypeSlug,
        $slug,
        $eoSlug,
        $user = null
    ) {
        $electedOfficial = $this->em->getRepository('GovWikiDbBundle:ElectedOfficial')
            ->findOne($environment->getId(), $altTypeSlug, $slug, $eoSlug);


        if (null !== $electedOfficial) {
            /*
            * Create queries for legislations, contributions and etc.
            */
            $votes = $this->em->getRepository('GovWikiDbBundle:ElectedOfficialVote')
                ->getListQuery($electedOfficial['id'], $user);
            $contributions = $this->em->getRepository('GovWikiDbBundle:Contribution')
                ->getListQuery($electedOfficial['id'], $user);
            $endorsements = $this->em->getRepository('GovWikiDbBundle:Endorsement')
                ->getListQuery($electedOfficial['id'], $user);
            $publicStatements = $this->em->getRepository('GovWikiDbBundle:PublicStatement')
                ->getListQuery($electedOfficial['id'], $user);
            $surveyResponses = $this->em->getRepository('GovWikiDbBundle:SurveyResponse')
                ->getListQuery($electedOfficial['id']);

            return [
                'electedOfficial' => $electedOfficial,
                'votes' => $votes,
                'contributions' => $contributions,
                'endorsements' => $endorsements,
                'publicStatements' => $publicStatements,
                'surveyResponses' => $surveyResponses,
                'categories' => $this->em
                    ->getRepository('GovWikiDbBundle:IssueCategory')
                    ->findAll(),
                'electedOfficials' => $this->em
                    ->getRepository('GovWikiDbBundle:Government')
                    ->governmentElectedOfficial($electedOfficial['id']),
            ];
        }

        return null;
    }
}
