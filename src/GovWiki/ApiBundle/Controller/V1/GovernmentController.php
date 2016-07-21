<?php

namespace GovWiki\ApiBundle\Controller\V1;

use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Entity\Issue;
use GovWiki\EnvironmentBundle\Strategy\GovwikiNamingStrategy;
use GovWiki\RequestBundle\Entity\IssueCreateRequest;
use JMS\Serializer\SerializationContext;
use JMS\Serializer\Serializer;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GovernmentController
 *
 * @Route("government")
 */
class GovernmentController extends AbstractGovWikiApiController
{

    const MAX_SALARIES_PER_PAGE = 25;
    const MAX_PENSIONS_PER_PAGE = 25;

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
        if (null === $search) {
            return $this->badRequestResponse(
                'Provide required query parameter \'search\''
            );
        }

        $governments = $this->getGovernmentManager()
            ->searchGovernment(
                $this->getCurrentEnvironment(),
                $search
            );

        return new JsonResponse($governments);
    }

    /**
     * @Route("/{altTypeSlug}/{slug}/get_ranks", methods={"GET"})
     *
     * Query parameters:
     *  field_name - field name in camelCase.
     *  limit      - max entities per request, default 25.
     *  page       - calculate offset based on this value, default null.
     *  order      - sorting order by given field_name, 'desc' or 'asc',
     *               default null.
     *  name_order - sorting order by government name, 'desc' or 'asc',
     *               default null.
     *  year       - year of desired data.
     *
     * @param Request $request     A Request instance.
     * @param string  $altTypeSlug Alt type slug.
     * @param string  $slug        Government slug.
     *
     * @return JsonResponse
     */
    public function getRanksAction(Request $request, $altTypeSlug, $slug)
    {
        $environment = $this->getCurrentEnvironment();

        $fieldName = $request->query->get('field_name', null);
        if ((null === $fieldName) || ('' === $fieldName)) {
            return new JsonResponse(
                [ 'message' => 'Provide field_name query parameter.' ],
                400
            );
        }

        /*
         * Check field name.
         */
        $fields = $this->getFormatManager()->getRankedFields($environment);
        $found = false;
        $tmp = GovwikiNamingStrategy::originalFromRankFieldName($fieldName);
        foreach ($fields as $field) {
            if ($field['field'] === $tmp) {
                $found = true;
                break;
            }
        }
        if (! $found) {
            return new JsonResponse([
                'message' => 'Unknown field name or maybe this field don\'t have rank.',
            ], 400);
        }

        $data = $this->getGovernmentManager()->getGovernmentRank(
            $environment,
            $altTypeSlug,
            $slug,
            [
                'field_name' => $fieldName,
                'limit' => $request->query->getInt('limit', 25),
                'page' => $request->query->getInt('page', 0),
                'order' => $request->query->get('order', null),
                'name_order' => $request->query->get('name_order', null),
                'year' => $request->query->getInt('year'),
            ]
        );

        /*
         * Canonize field name and value.
         */
        foreach ($data as &$row) {
            $row['name'] = str_replace('_', ' ', $row['name']);
        }

        return new JsonResponse([
            'data' => $data,
            'alt_type' => str_replace('_', ' ', $altTypeSlug),
        ]);
    }

    /**
     * @Route("/{government}/new_issue", methods={ "POST" })
     * @Security("is_granted('ROLE_USER')")
     *
     * @param Request    $request    A Request instance.
     * @param Government $government A Government entity instance.
     *
     * @return JsonResponse
     */
    public function issueAction(Request $request, Government $government)
    {
        $issue = new Issue();
        $issue
            ->setCreator($this->getUser())
            ->setGovernment($government);

        $form = $this->createForm('document', $issue);
        $form->handleRequest($request);
        if ($form->isValid()) {
            /** @var Serializer $serializer */
            $serializer = $this->get('jms_serializer');
            $em = $this->getDoctrine()->getManager();

            $em->persist($issue);
            $em->flush();

            // Serialize new issue.
            $context = SerializationContext::create()
                ->setGroups('api');
            $issue = $serializer->serialize($issue, 'json', $context);

            return new Response($issue);
        }

        return $this->formError($form);
    }
}
