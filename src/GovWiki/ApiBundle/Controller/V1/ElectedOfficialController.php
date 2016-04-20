<?php

namespace GovWiki\ApiBundle\Controller\V1;

use GovWiki\DbBundle\Entity\Repository\ListedEntityRepositoryInterface;
use GovWiki\FrontendBundle\Controller\ElectedController;
use GovWiki\UserBundle\Entity\User;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * ElectedOfficialController
 */
class ElectedOfficialController extends AbstractGovWikiApiController
{

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
        $user = $this->getUser();

        if ($user instanceof User) {
            $user = $user->getId();
        } else {
            $user = null;
        }

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
                    $repository->getListQueryBySlugs($govAltTypeSlug, $govSlug, $eoSlug, $user),
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
        if (null === $search) {
            return $this->badRequestResponse(
                'Provide required query parameter \'search\''
            );
        }

        return new JsonResponse($this->getElectedOfficialManager()
            ->searchElectedOfficial(
                $this->getCurrentEnvironment(),
                $search
            )
        );
    }
}
