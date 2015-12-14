<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\DbBundle\Entity\Environment;
use GovWiki\DbBundle\Form\EnvironmentType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Request;

/**
 * MainController
 */
class MainController extends AbstractGovWikiAdminController
{
    const ENVIRONMENTS_LIMIT = 25;

    /**
     * Show list of available environments.
     *
     * @Configuration\Route("/")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function homeAction(Request $request)
    {
        $environments = $this->paginate(
            $this->getDoctrine()
                ->getRepository('GovWikiDbBundle:Environment')
                ->getListQuery(),
            $request->query->getInt('page', 1),
            self::ENVIRONMENTS_LIMIT
        );

        return [ 'environments' => $environments ];
    }

    /**
     * Create new environment. Show and process environment form. After success
     * processing of form redirect to map creation.
     *
     * @Configuration\Route("/new")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function newAction(Request $request)
    {
        $environment = new Environment();
        $form = $this->createForm(new EnvironmentType(), $environment);
        $form->handleRequest($request);

        if ($form->isValid() && $form->isSubmitted()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($environment);
            $em->flush();

            /*
             * Forward to map controller in order to create new map.
             */
            return $this->forward('GovWikiAdminBundle:Map:new', [
                'environment' => $environment,
            ]);
        }
        return [ 'form' => $form->createView() ];
    }

    /**
     * @Configuration\Route("/{environment}")
     * @Configuration\Template()
     *
     * @param string $environment Environment name.
     *
     * @return array
     */
    public function showAction($environment)
    {
        $environmentObj = $this->getDoctrine()
            ->getRepository('GovWikiDbBundle:Environment')
            ->getByName($environment);

        if (null === $environmentObj) {
            throw $this->createNotFoundException(
                "Environment with name $environment not found"
            );
        }

        return [ 'environment' => $environmentObj ];
    }

    /**
     * @Configuration\Route("/{environment}/delete")
     *
     * @param string $environment Environment name.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function removeAction($environment)
    {
        $environmentObj = $this->getDoctrine()
            ->getRepository('GovWikiDbBundle:Environment')
            ->getReferenceByName($environment);

        if ($environmentObj instanceof \Proxies\__CG__\GovWiki\DbBundle\Entity\Environment) {
            $em = $this->getDoctrine()->getManager();
            $em->remove($environmentObj);
            $em->flush();
        }

        return $this->redirectToRoute('govwiki_admin_main_home');
    }
}
