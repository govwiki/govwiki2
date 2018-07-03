<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\AdminBundle\Entity\Repository\ScriptExecutionLogRepository;
use GovWiki\AdminBundle\Entity\Repository\ScriptParameterRepository;
use GovWiki\AdminBundle\Entity\Repository\ScriptQueueItemRepository;
use GovWiki\AdminBundle\Entity\Script;
use GovWiki\AdminBundle\Entity\ScriptExecutionLog;
use GovWiki\AdminBundle\Entity\ScriptParameter;
use GovWiki\AdminBundle\Entity\ScriptQueueItem;
use GovWiki\AdminBundle\Form\ScriptParametersForm;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class ScriptController
 *
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "/{environment}/scripts",
 *  requirements={
 *      "environment": "\w+"
 *  })
 * @Configuration\Security("is_granted('ROLE_ADMIN')")
 */
class ScriptController extends AbstractGovWikiAdminController
{

    /**
     * @Configuration\Route("/")
     * @Configuration\Template
     *
     * @return array
     */
    public function indexAction(): array
    {
        $repository = $this->getDoctrine()->getRepository(Script::class);

        return [
            'scripts' => $repository->findAll(),
        ];
    }

    /**
     * @Configuration\Route("/{name}/log", requirements={ "name": ".+" }, methods={ "GET" })
     * @Configuration\Template
     *
     * @param Request $request A http request.
     * @param string  $name    Script name.
     *
     * @return array
     */
    public function logAction(Request $request, string $name): array
    {
        /** @var ScriptExecutionLogRepository $repository */
        $repository = $this->getDoctrine()->getRepository(ScriptExecutionLog::class);

        return [
            'script' => $name,
            'log' => $this->paginate(
                $repository->getBuilderForScript($name),
                $request->query->getInt('page', 1),
                $request->query->getInt('limit', 10)
            ),
        ];
    }

    /**
     * @Configuration\Route(
     *     "/{name}/parameters",
     *     requirements={ "name": ".+" },
     *     methods={ "GET", "POST" }
     * )
     * @Configuration\Template
     *
     * @param Request $request     A http request.
     * @param string  $environment Current environment name.
     * @param string  $name        Script name.
     *
     * @return array|RedirectResponse
     */
    public function parametersAction(Request $request, string $environment, string $name)
    {
        /** @var ScriptParameterRepository $repository */
        $repository = $this->getDoctrine()->getRepository(ScriptParameter::class);
        $parameters = $repository->getForScript($name);

        $form = $this->createForm(new ScriptParametersForm(), $parameters)
            ->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            foreach ($parameters as $parameter) {
                $em->persist($parameter);
            }

            $em->flush();
            $this->addFlash('success', 'All parameters is updated');

            return $this->redirectToRoute('govwiki_admin_script_index', [
                'environment' => $environment,
            ]);
        }

        return [
            'script' => $name,
            'form' => $form->createView(),
            'parameters' => $parameters,
        ];
    }

    /**
     * @Configuration\Route(
     *     "/{name}/run",
     *     requirements={ "name": ".+" },
     *     methods={ "GET" }
     * )
     *
     * @param string $environment Current environment.
     * @param string $name        Script name.
     *
     * @return RedirectResponse
     */
    public function runAction(string $environment, string $name): RedirectResponse
    {
        $scriptRepository = $this->getDoctrine()->getRepository(Script::class);
        /** @var ScriptQueueItemRepository $scriptQueueItemRepository */
        $scriptQueueItemRepository = $this->getDoctrine()->getRepository(ScriptQueueItem::class);

        $script = $scriptRepository->findOneBy([ 'name' => $name ]);
        if (! $script instanceof Script) {
            throw $this->createNotFoundException();
        }

        $scriptQueueItemRepository->push($script);

        return $this->redirectToRoute('govwiki_admin_script_index', [
            'environment' => $environment,
        ]);
    }
}
