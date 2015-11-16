<?php

namespace GovWiki\ApiBundle\Controller;

use GovWiki\DbBundle\Entity\Repository\CreateRequestRepository;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;
use JMS\Serializer\SerializationContext;

/**
 * ElectedOfficialController
 */
class ElectedOfficialController extends Controller
{
    /**
     * @Route("/{govAltTypeSlug}/{govSlug}/{eoSlug}", methods="GET")
     *
     * @param  string $govAltTypeSlug Slugged government alt type.
     * @param  string $govSlug        Slugged government name.
     * @param  string $eoSlug         Slugged elected official name.
     *
     * @return Response
     */
    public function showElectedOfficialAction($govAltTypeSlug, $govSlug, $eoSlug)
    {
        $em = $this->getDoctrine()->getManager();
        /** @var CreateRequestRepository $repository */
        $repository = $em->getRepository('GovWikiDbBundle:CreateRequest');

//        $government = $em->getRepository('GovWikiDbBundle:Government')->findOneBy(['altTypeSlug' => $govAltTypeSlug, 'slug' => $govSlug]);
//        /** @var ElectedOfficial $electedOfficial */
//        $electedOfficial = $em->getRepository('GovWikiDbBundle:ElectedOfficial')->findOneBy(['government' => $government, 'slug' => $eoSlug]);

        /** @var \Doctrine\ORM\QueryBuilder $qb */
        $qb = $em->getRepository('GovWikiDbBundle:ElectedOfficial')->createQueryBuilder('ElectedOfficial');
        $electedOfficial = $qb
            ->addSelect('Contribution, Endorsement, PublicStatement, Vote, Legislation')
            ->leftJoin('ElectedOfficial.contributions', 'Contribution')
            ->leftJoin('ElectedOfficial.endorsements', 'Endorsement')
            ->leftJoin('ElectedOfficial.publicStatements', 'PublicStatement')
            ->leftJoin('ElectedOfficial.votes', 'Vote')
            ->leftJoin('ElectedOfficial.government', 'Government')
            ->leftJoin('Vote.legislation', 'Legislation')
            ->where(
                $qb->expr()->andX(
                    $qb->expr()->eq(
                        'ElectedOfficial.slug',
                        $qb->expr()->literal($eoSlug)
                    ),
                    $qb->expr()->eq(
                        'Government.altTypeSlug',
                        $qb->expr()->literal($govAltTypeSlug)
                    ),
                    $qb->expr()->eq(
                        'Government.slug',
                        $qb->expr()->literal($govSlug)
                    )
                )
            )
            ->getQuery()
            ->getOneOrNullResult();

        $serializer = $this->get('jms_serializer');
        $context = SerializationContext::create()
            ->setGroups('elected_official')
            ->enableMaxDepthChecks();

        $response = new Response();
        $response->setContent($serializer->serialize(
            [
                'person' => $electedOfficial,
                'createRequests' => $repository->getCreateRequestFor($electedOfficial->getId()),
                'categories' => $em->getRepository('GovWikiDbBundle:IssueCategory')->findAll(),
            ],
            'json',
            $context
        ));
        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }
}
