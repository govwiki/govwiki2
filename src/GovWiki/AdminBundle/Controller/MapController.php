<?php

namespace GovWiki\AdminBundle\Controller;

use CartoDbBundle\CartoDbServices;
use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\AdminBundle\Manager\AdminEnvironmentManager;
use GovWiki\DbBundle\Entity\Map;
use GovWiki\DbBundle\Form\MapType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Class MapController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route("/map")
 */
class MapController extends AbstractGovWikiAdminController
{
    /**
     * @Configuration\Route("/edit")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     *
     * @throws NotFoundHttpException Can't find map for given environment.
     * @throws \LogicException If DoctrineBundle is not available.
     * @throws \InvalidArgumentException Unknown manager.
     */
    public function editAction(Request $request)
    {
        /** @var AdminEnvironmentManager $manager */
        $manager = $this->get(GovWikiAdminServices::ADMIN_ENVIRONMENT_MANAGER);

        /** @var Map $map */
        $map = $manager->getMap();
        if (null === $map) {
            throw new NotFoundHttpException();
        }

        $form = $this->createForm(new MapType(), $map);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            /*
             * This stuff is required because doctrine compare by reference.
             */
            $new = clone $map->getColorizedCountyConditions();
            $map->setColorizedCountyConditions($new);

            $em->persist($map);
            $em->flush();
        }

        return [ 'form' => $form->createView() ];
    }
}
