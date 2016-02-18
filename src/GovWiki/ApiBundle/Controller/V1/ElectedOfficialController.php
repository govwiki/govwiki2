<?php

namespace GovWiki\ApiBundle\Controller\V1;

use GovWiki\DbBundle\Entity\Repository\ListedEntityRepositoryInterface;
use GovWiki\FrontendBundle\Controller\ElectedController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * ElectedOfficialController
 */
class ElectedOfficialController extends AbstractGovWikiApiController
{
//    /**
//     * @Route("/{govAltTypeSlug}/{govSlug}/{eoSlug}", methods="GET")
//     *
//     * @param  string $govAltTypeSlug Slugged government alt type.
//     * @param  string $govSlug        Slugged government name.
//     * @param  string $eoSlug         Slugged elected official name.
//     *
//     * @return Response
//     */
//    public function showElectedOfficialAction($govAltTypeSlug, $govSlug, $eoSlug)
//    {
////        $em = $this->getDoctrine()->getManager();
////        /** @var CreateRequestRepository $repository */
////        $repository = $em->getRepository('GovWikiDbBundle:CreateRequest');
////
//////        $government = $em->getRepository('GovWikiDbBundle:Government')->findOneBy(['altTypeSlug' => $govAltTypeSlug, 'slug' => $govSlug]);
//////        /** @var ElectedOfficial $electedOfficial */
//////        $electedOfficial = $em->getRepository('GovWikiDbBundle:ElectedOfficial')->findOneBy(['government' => $government, 'slug' => $eoSlug]);
////
////        /** @var \Doctrine\ORM\QueryBuilder $qb */
////        $qb = $em->getRepository('GovWikiDbBundle:ElectedOfficial')->createQueryBuilder('ElectedOfficial');
////        /** @var ElectedOfficial $electedOfficial */
////        $electedOfficial = $qb
////            ->addSelect('Contribution, Endorsement, PublicStatement, Vote, Legislation, Government')
////            ->leftJoin('ElectedOfficial.contributions', 'Contribution')
////            ->leftJoin('ElectedOfficial.endorsements', 'Endorsement')
////            ->leftJoin('ElectedOfficial.publicStatements', 'PublicStatement')
////            ->leftJoin('ElectedOfficial.votes', 'Vote')
////            ->leftJoin('ElectedOfficial.government', 'Government')
////            ->leftJoin('Vote.legislation', 'Legislation')
////            ->where(
////                $qb->expr()->andX(
////                    $qb->expr()->eq(
////                        'ElectedOfficial.slug',
////                        $qb->expr()->literal($eoSlug)
////                    ),
////                    $qb->expr()->eq(
////                        'Government.altTypeSlug',
////                        $qb->expr()->literal($govAltTypeSlug)
////                    ),
////                    $qb->expr()->eq(
////                        'Government.slug',
////                        $qb->expr()->literal($govSlug)
////                    )
////                )
////            )
////            ->getQuery()
////            ->getOneOrNullResult();
////
////        $serializer = $this->get('jms_serializer');
////        $context = SerializationContext::create()
////            ->setGroups('elected_official')
////            ->enableMaxDepthChecks();
////
////        $response = new Response();
////        $response->setContent($serializer->serialize(
////            [
////                'person' => $electedOfficial,
////                'createRequests' => $repository->getCreateRequestFor($electedOfficial->getId()),
////                'categories' => $em->getRepository('GovWikiDbBundle:IssueCategory')->findAll(),
////                'electedOfficials' => $em->getRepository('GovWikiDbBundle:Government')->governmentElectedOfficial($electedOfficial->getId()),
////            ],
////            'json',
////            $context
////        ));
////        $response->headers->set('Content-Type', 'application/json');
////
////        return $response;
//
//        return $this->serializedResponse(
//            $this->environmentManager()
//                ->getElectedOfficial($govAltTypeSlug, $govSlug, $eoSlug),
//            [ 'elected_official' ]
//        );
//    }

    /**
     * @Route("/{govAltTypeSlug}/{govSlug}/{eoSlug}", methods="GET")
     *
     * @param Request $request        A Request instance.
     * @param string  $govAltTypeSlug Slugged government alt type.
     * @param string  $govSlug        Slugged government name.
     * @param string  $eoSlug         Slugged elected official name.
     *
     * @return Response
     *
     * @throws \LogicException Some required bundle not registered.
     */
    public function sortAction(Request $request, $govAltTypeSlug, $govSlug, $eoSlug)
    {
        $entity = $request->query->get('entity');
        $templateName = strtolower($entity);
        $templateName = "@GovWikiFrontend/Partial/Elected/Lists/{$templateName}.html.twig";
        $entity = substr($entity, 0, strlen($entity) - 1);

        if ('Vote' === $entity) {
            $entity = 'ElectedOfficialVote';
        } elseif ('Statement' === $entity) {
            $entity = 'PublicStatement';
        }

        /** @var ListedEntityRepositoryInterface $repository */
        $repository = $this->getDoctrine()
            ->getRepository('GovWikiDbBundle:'. $entity);

        return $this->render($templateName, [
            'list' => $this->get('knp_paginator')
                ->paginate(
                    $repository->getListQueryBySlugs($govAltTypeSlug, $govSlug, $eoSlug),
                    $request->query->getInt('page', 1),
                    ElectedController::ROWS_PER_PAGE
                ),
        ]);
    }

    /**
     * @Route("/search")
     *
     * @param Request $request A Request instance.
     *
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function searchAction(Request $request)
    {
        $search = $request->query->get('search', null);
        error_log('search = '.$search);
        if (null === $search) {
            return $this->badRequestResponse(
                'Provide required query parameter \'search\''
            );
        }

        return new JsonResponse($this->environmentManager()
            ->searchElectedOfficial($search));
    }
}
