<?php

namespace GovWiki\ApiBundle\Controller\V1;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * SearchController
 *
 * @Route("search")
 */
class SearchController extends AbstractGovWikiApiController
{

    /**
     * Search governments and elected officials.
     *
     * @Route("/")
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
        $governments = array_map(
            function (array $row) {
                $row['type'] = 'government';

                return $row;
            },
            $governments
        );

        $electedOfficials = $this->getElectedOfficialManager()
            ->searchElectedOfficial(
                $this->getCurrentEnvironment(),
                $search
            );
        $electedOfficials = array_map(
            function (array $row) {
                $row['type'] = 'electedOfficial';

                return $row;
            },
            $electedOfficials
        );

        return new JsonResponse(array_merge($governments, $electedOfficials));
    }
}
