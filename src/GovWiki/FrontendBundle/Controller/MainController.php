<?php

namespace GovWiki\FrontendBundle\Controller;

use Doctrine\DBAL\Driver\Connection;
use FOS\UserBundle\Model\UserManagerInterface;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\EnvironmentBundle\Controller\AbstractGovWikiController;
use GovWiki\UserBundle\Entity\User;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Translation\MessageCatalogue;
use Symfony\Component\Translation\Translator;

/**
 * Class MainController
 *
 * @package GovWiki\FrontendBundle\Controller
 */
class MainController extends AbstractGovWikiController
{

    /**
     * @return RedirectResponse
     */
    public function indexAction(): RedirectResponse
    {
        $qb = $this->getDoctrine()->getRepository('GovWikiDbBundle:Environment')
            ->createQueryBuilder('Environment');
        $expr = $qb->expr();

        $name = $qb
            ->select('Environment.slug')
            ->where(
                $expr->eq('Environment.slug', $expr->literal('puerto_rico'))
            )
            ->orderBy($expr->desc('Environment.id'))
            ->setMaxResults(1)
            ->getQuery()
            ->getSingleScalarResult();

        return $this->redirectToRoute('map', [ 'environment' => $name ]);
    }

    /**
     * @Route("/not-found", name="disabled")
     * @Template
     *
     * @return array
     */
    public function disabledAction(): array
    {
        return [];
    }

    /**
     * @Route("/", name="map")
     * @Template("GovWikiFrontendBundle:Main:map.html.twig")
     *
     * @param Request $request A Request instance.
     *
     * @return Response
     */
    public function mapAction(Request $request): Response
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('disabled');
        }

        $environment = $this->getCurrentEnvironment();

        if ($environment->getMap()->isCreated()) {
            return $this->renderMap($request, $environment);
        }

        return $this->redirectToRoute('govwiki_filelibrary_document_index');
    }

    /**
     * @Route("/download-all-data", name="download_all_data")
     * @return Response
     */
    public function downloadAllDataAction(): Response
    {
        $response = new StreamedResponse();
        $response->setCallback(function () {
            $handle = fopen('php://output', 'w+');

            /** @var Connection $conn */
            $conn = $this->getDoctrine()->getConnection();

            $sql = '
                select governments.name, puerto_rico.*
                from puerto_rico
                inner join governments on (governments.id = puerto_rico.government_id)
                order by name, year
            ';

            $stmt = $conn->prepare($sql);
            $stmt->execute();

            $labels = false;

            while ($row = $stmt->fetch()) {

                if (!$labels) {
                    fputcsv($handle, array_keys($row), ',');
                    $labels = true;
                }

                fputcsv($handle, $row, ',');
            }

            fclose($handle);
        });

        $response->setStatusCode(200);
        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="export.csv"');

        return $response;
    }

    /**
     * @param Request     $request     A HTTP Request.
     * @param Environment $environment A current environment.
     *
     * @return Response
     */
    private function renderMap(Request $request, Environment $environment): Response
    {
        $map = $environment->getMap();
        /** @var Translator $translator */
        $translator = $this->get('translator');

        $years = $this->getGovernmentManager()->getAvailableYears($environment);
        $currentYear = (\count($years) > 0) ? 'latest' : 0;

        $coloringConditions = $map->getColoringConditions();
        $fieldMask = $this->getFormatManager()
            ->getFieldFormat($environment, $coloringConditions->getFieldName());
        $localizedName = $translator
            ->trans('format.'. $coloringConditions->getFieldName());

        $map = $map->toArray();
        $map['coloringConditions']['field_mask'] = $fieldMask;
        $map['coloringConditions']['localized_name'] = $localizedName;
        $map['username'] = $this->getParameter('carto_db.account');
        $map['year'] = $currentYear;

        $greetingText = $translator->trans('map.greeting_text');
        if ($greetingText === 'map.greeting_text') {
            $greetingText = '';
        }

        /** @var $formFactory \FOS\UserBundle\Form\Factory\FactoryInterface */
        $formFactory = $this->get('fos_user.change_password.form.factory');

        $user = $this->getUser();
        $params = [
            'map' => json_encode($map),
            'greetingText' => $greetingText,
            'years' => $years,
            'currentYear' => $currentYear,
        ];

        $params['formValid'] = null;
        if ($user instanceof User) {
            $form = $formFactory->createForm();
            $form->setData($user);
            $form->handleRequest($request);

            if ($form->isSubmitted()) {
                if ($form->isValid()) {
                    /** @var UserManagerInterface $userManager */
                    $userManager = $this->get('fos_user.user_manager');
                    $userManager->updateUser($user);
                    $params['formValid'] = true;
                } else {
                    $params['formValid'] = false;
                }
            }

            $params['form'] = $form->createView();
        }

        return $this->render('GovWikiFrontendBundle:Main:map.html.twig', $params);
    }
}
