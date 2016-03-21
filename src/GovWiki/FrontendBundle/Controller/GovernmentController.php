<?php

namespace GovWiki\FrontendBundle\Controller;

use GovWiki\ApiBundle\GovWikiApiServices;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Utils\Functions;
use GovWiki\UserBundle\Entity\User;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * MainController
 */
class GovernmentController extends Controller
{

    /**
     * Toggle government subscribe.
     *
     * @Route("/{government}/subscribe")
     * @ParamConverter(
     *  class="\GovWiki\DbBundle\Entity\Government",
     *  options={
     *      "repository_method": "getWithSubscribers"
     *  }
     * )
     *
     * @param Government $government A Government instance.
     *
     * @return JsonResponse
     */
    public function subscribeAction(Government $government)
    {
        /** @var User $user */
        $user = $this->getUser();
        $em = $this->getDoctrine()->getManager();

        if ($government->isSubscriber($user)) {
            $government->removeSubscribers($user);
        } else {
            $government->addSubscribers($user);
        }

        $em->persist($government);
        $em->flush();

        return new JsonResponse();
    }

    /**
     * @Route("/{altTypeSlug}/{slug}", name="government")
     * @Template("GovWikiFrontendBundle:Government:index.html.twig")
     *
     * @param Request $request     A Request instance.
     * @param string  $altTypeSlug Slugged government alt type.
     * @param string  $slug        Slugged government name.
     *
     * @return array
     */
    public function governmentAction(Request $request, $altTypeSlug, $slug)
    {
        $this->clearTranslationsCache();
        $manager = $this->get(GovWikiApiServices::ENVIRONMENT_MANAGER);
        $user = $this->getUser();

        $years = $manager->getAvailableYears();
        $currentYear = $request->query->getInt('year', $years[0]);

        $data = $manager
            ->getGovernment(
                $altTypeSlug,
                $slug,
                $currentYear
            );

        $finData = $data['government']['finData'];
        /*
         * Translate.
         */
        $translator = $this->get('translator');

        function getTransKey($caption) {
            return strtr(strtolower($caption), [
                ' ' => '_',
                '-' => '_d_',
                '&' => 'amp',
                ',' => '_c_',
                '(' => 'lb',
                ')' => 'rb',
                '/' => 'sl',
                '%' => 'proc',
                "'" => '_apos_',
            ]);
        }

        $finData = array_map(
            function (array $row) use ($translator) {
                $captionKey = 'findata.captions.'. getTransKey($row['caption']);
                $categoryKey = 'general.findata.main.'. getTransKey($row['category_name']);

                $row['translatedCaption'] = $translator->trans($captionKey);
                $row['translatedCategory'] = $translator->trans($categoryKey);

                return $row;
            },
            $finData
        );


        $finData = Functions::groupBy(
            $finData,
            [ 'category_name', 'caption' ]
        );
        /*
        * Sort findata by display order.
        */
        foreach ($finData as &$statement) {
            uasort($statement, function ($a, $b) {
                $a = $a['display_order'];
                $b = $b['display_order'];

                if ($a === $b) {
                    return 0;
                }

                return ($a < $b) ? -1: 1;
            });
        }

        $data['government']['financialStatements'] = $finData;

        $data['isSubscriber'] = false;
        if ($user instanceof User) {
            $data['isSubscriber'] = $this->getDoctrine()
                ->getRepository('GovWikiDbBundle:Government')
                ->isSubscriber($data['government']['id'], $user->getId());
        }

        $data['years'] = $years;
        $data['government']['translations'] = [
            'total_revenue' => $translator->trans('general.findata.main.total_revenue'),
            'total_expenditure' => $translator->trans('general.findata.main.total_expenditure'),
        ];

        $data['government_json'] = json_encode($data['government']);
        return $data;
    }

    private function clearTranslationsCache()
    {
        $cacheDir = __DIR__ . "/../../../../app/cache";
        $finder = new \Symfony\Component\Finder\Finder();
        $finder->in([$cacheDir . "/" . $this->container->getParameter('kernel.environment') . "/translations"])->files();
        foreach($finder as $file){
            unlink($file->getRealpath());
        }
    }
}
