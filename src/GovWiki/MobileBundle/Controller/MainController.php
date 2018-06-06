<?php

namespace GovWiki\MobileBundle\Controller;

use FOS\UserBundle\Model\UserManagerInterface;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\EnvironmentBundle\Controller\AbstractGovWikiController;
use GovWiki\UserBundle\Entity\User;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Translation\MessageCatalogue;

/**
 * MainController
 */
class MainController extends AbstractGovWikiController
{

    /**
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function indexAction()
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
     * @Route("/", name="map")
     *
     * @param Request $request A Request instance.
     *
     * @return Response
     */
    public function mapAction(Request $request)
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
     * @param Request     $request     A HTTP Request.
     * @param Environment $environment A current environment.
     *
     * @return Response
     */
    public function renderMap(Request $request, Environment $environment): Response
    {
        $translator = $this->get('translator');

        $years = $this->getGovernmentManager()->getAvailableYears($environment);
        $currentYear = (\count($years) > 0) ? $years[0] : 0;

        $map = $environment->getMap();
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

        /** @var MessageCatalogue $catalogue */
        $catalogue = $translator->getCatalogue();
        $transKey = 'map.greeting_text';

        $greetingText = '';
        if ($catalogue->has($transKey)) {
            $greetingText = $translator->trans($transKey);
        }
        $params = [
            'map' => \json_encode($map),
            'greetingText' => $greetingText,
            'years' => $years,
            'currentYear' => $currentYear,
        ];

        /** @var $formFactory \FOS\UserBundle\Form\Factory\FactoryInterface */
        $formFactory = $this->get('fos_user.change_password.form.factory');

        $user = $this->getUser();
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

        return $this->render('GovWikiMobileBundle:Main:map.html.twig', $params);
    }
}
