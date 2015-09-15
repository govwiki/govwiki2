<?php

namespace GovWiki\ApiBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use JMS\Serializer\SerializationContext;

/**
 * GovernmentController
 */
class GovernmentController extends Controller
{
    /**
     * @Route("/{alt_type_slug}/{slug}", methods="GET")
     *
     * @param  string $alt_type_slug
     * @param  string $slug
     * @return Response
     */
    public function showAction($alt_type_slug, $slug)
    {
        $em = $this->getDoctrine()->getManager();

        $government = $em->getRepository('GovWikiDbBundle:Government')->findOneBy(['altTypeSlug' => $alt_type_slug, 'slug' => $slug]);
        $maxRanks   = $em->getRepository('GovWikiDbBundle:MaxRank')->find(1);

        $serializer = $this->get('jms_serializer');

        $serializedGovernment = $serializer->serialize($government, 'json', SerializationContext::create()->enableMaxDepthChecks());
        $serializedMaxRanks   = $serializer->serialize($maxRanks, 'json');

        $finData = $em->getRepository('GovWikiDbBundle:FinData')->findByGovernment($government);
        foreach ($finData as $finDataItem) {
            $financialStatementsGroups[$finDataItem->getCaption()][] = $finDataItem;
        }

        $i = 0;
        foreach ($financialStatementsGroups as $caption => $finData) {
            foreach ($finData as $finDataItem) {
                $financialStatements[$i]['caption'] = $caption;
                $financialStatements[$i]['category_name'] = $finDataItem->getCaptionCategory()->getName();
                $financialStatements[$i]['display_order'] = $finDataItem->getDisplayOrder();
                if (empty($financialStatements[$i]['genfund'])) {
                    if (empty($finDataItem->getFund())) {
                        $financialStatements[$i]['genfund'] = $finDataItem->getDollarAmount();
                    } elseif ($finDataItem->getFund()->getName() == 'General Fund') {
                        $financialStatements[$i]['genfund'] = $finDataItem->getDollarAmount();
                    }
                }
                if (empty($financialStatements[$i]['otherfunds'])) {
                    if (!empty($finDataItem->getFund()) and $finDataItem->getFund()->getName() == 'Other') {
                        $financialStatements[$i]['otherfunds'] = $finDataItem->getDollarAmount();
                    }
                }
                if (empty($financialStatements[$i]['totalfunds'])) {
                    if (!empty($finDataItem->getFund()) and $finDataItem->getFund()->getName() == 'Total') {
                        $financialStatements[$i]['totalfunds'] = $finDataItem->getDollarAmount();
                    }
                }
            }
            $i++;
        }

        $decoded                         = json_decode($serializedGovernment, true);
        $decoded['financial_statements'] = $financialStatements;
        $decoded['max_ranks']            = json_decode($serializedMaxRanks, true);
        $serializedGovernment            = json_encode($decoded);

        $response = new Response();
        $response->setContent($serializedGovernment);
        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }

    /**
     * @Route("/get-markers-data", methods="GET")
     *
     * Get markers data
     *
     * @param  Request $request
     * @return JsonResponse
     */
    public function getMarkersDataAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $query = $request->query->all();

        $qb = $em->createQueryBuilder()
            ->select('g.id', 'g.name', 'g.altType', 'g.type', 'g.city', 'g.zip', 'g.state',
                     'g.latitude', 'g.longitude', 'g.altTypeSlug', 'g.slug')
            ->from('GovWikiDbBundle:Government', 'g')
            ->where('g.altType != :altType')
            ->setParameter('altType', 'County');

        if (!empty($query['altTypes'])) {
            $orX = $qb->expr()->orX();
            foreach ($query['altTypes'] as $key => $type) {
                $orX->add($qb->expr()->eq('g.altType', ':altType'.$key));
                $parameters['altType'.$key]  = $type;
            }
            $parameters['altType'] = 'County';
            $qb->andWhere($orX)->setParameters($parameters);
        }

        $qb->setMaxResults(200)->orderBy('g.rand', 'ASC');

        $data = $qb->getQuery()->getArrayResult();

        return new JsonResponse($data);
    }
}
