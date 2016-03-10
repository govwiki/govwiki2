<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\DbBundle\Entity\Government;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Constraints\NotBlank;

/**
 * Class SubscribeController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "/{government}/subscribe",
 *  requirements={ "governments": "\d+" }
 * )
 */
class SubscribeController extends AbstractGovWikiAdminController
{
    const MAX_PER_PAGE = 25;

    /**
     * @Configuration\Route("/")
     * @Configuration\Template()
     *
     * @param Request    $request    A Request instance.
     * @param Government $government A Government instance.
     *
     * @return array
     */
    public function indexAction(Request $request, Government $government)
    {
        $form = $this->createFormBuilder()
            ->add('message', 'ckeditor', [ 'constraints' => new NotBlank() ])
            ->getForm();

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $message = $form->getData()['message'];

            $subscribers = $this->getDoctrine()
                ->getRepository('GovWikiUserBundle:User')
                ->getGovernmentSubscribersEmailData($government->getId());

            $this->successMessage('Message sent to subscribers');


            return $this->redirectToRoute('govwiki_admin_subscribe_index', [
                'government' => $government->getId(),
            ]);
        }

        return [
            'form' => $form->createView(),
            'government' => $government,
            'subscribers' => $this->paginate(
                $this->getDoctrine()
                    ->getRepository('GovWikiUserBundle:User')
                    ->getGovernmentSubscribersQuery($government->getId()),
                $request->query->get('page', 1),
                self::MAX_PER_PAGE
            ),
        ];
    }
}
