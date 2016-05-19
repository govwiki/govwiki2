<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\DbBundle\Entity\Environment;
use GovWiki\UserBundle\Entity\User;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class MainController
 * @package GovWiki\AdminBundle\Controller
 */
class MainController extends AbstractGovWikiAdminController
{
    const ENVIRONMENTS_LIMIT = 25;

    /**
     * @Configuration\Route("/")
     * @Configuration\Template()
     * @Configuration\Security("is_granted('ROLE_MANAGER')")
     *
     * @param Request $request A Request instance.
     *
     * @return array
     *
     * @throws \LogicException Some required bundle not registered.
     */
    public function homeAction(Request $request)
    {
        /** @var User $user */
        $user = $this->getUser();
        if ($user->hasRole('ROLE_ADMIN')) {
            $user = null;
        } else {
            $user = $user->getId();
        }

        $environments = $this->paginate(
            $this->getDoctrine()
                ->getRepository('GovWikiDbBundle:Environment')
                ->getListQuery($user),
            $request->query->getInt('page', 1),
            self::ENVIRONMENTS_LIMIT
        );
        return [ 'environments' => $environments ];
    }

    /**
     * Save images
     *
     * @Configuration\Route("/load-favicon")
     * @param Request $request
     *
     * @return Response
     */
    public function faviconLoadAction(Request $request)
    {
        if ($request->isXmlHttpRequest()) {
            $user = $this->getUser();
            if ($user->hasRole('ROLE_ADMIN') || $user->hasRole('ROLE_MANAGER')) {

                // validate extension
                $extensionValues = [
                    'ico',
                ];

                // get environment name
                $folderName = $request->request->get('environment');

                // favicon dir
                $dir = $this->get('kernel')->getRootDir().'/../web/img/'.$folderName;

                $image = $request->files->get('upload-favicon');
                $fileName = $image->getClientOriginalName();
                $extension = explode('.', $fileName);
                $extension = array_pop($extension);
                //$size = $image->getClientSize()/1000; // KB

                // validate by extension
                if (in_array($extension, $extensionValues)) {
                    if (!file_exists($dir)) {
                        mkdir($dir);
                    }

                    $image->move($dir, 'favicon.ico');

                    return new JsonResponse(
                        [
                            'message' => 'Favicon upload success!',
                            'error' => false,
                        ]
                    );
                }

                return new JsonResponse(
                    [
                        'message' => 'Broken favicon extension! Favicon not loaded',
                        'error' => true,
                    ]
                );
            }
        }

        throw $this->createNotFoundException();
    }

    /**
     * Load logo
     *
     * @Configuration\Route("/load-logo")
     * @param Request $request
     *
     * @return Response
     */
    public function loadImageAction(Request $request)
    {
        if ($request->isXmlHttpRequest()) {
            $environment = $request->request->get('environment');
            $image       = $request->files->get('upload-image');
            $id          = $request->request->get('id');

            if ($environment) {
                // get environment name
                $folderName = $request->request->get('environment');

                // favicon dir
                $dir = $this->get('kernel')->getRootDir().'/../web/img/'.$folderName;
                if (!file_exists($dir)) {
                    mkdir($dir);
                }

                $fileName = $image->getClientOriginalName();
                $extension = explode('.', $fileName);
                $extension = array_pop($extension);

                $em = $this->getDoctrine()->getManager();
                $content = $em->getRepository("GovWikiDbBundle:EnvironmentContents")->find($id);
                $image->move($dir, $content->getSlug().'.'.$extension);
                $content->setValue('/img/'.$folderName.'/'.$content->getSlug().'.'.$extension);
                $em->flush();
            }

            return new JsonResponse(['status' => 'Image success upload']);
        }

        throw $this->createNotFoundException();
    }
}
