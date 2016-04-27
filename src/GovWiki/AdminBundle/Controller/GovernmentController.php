<?php

namespace GovWiki\AdminBundle\Controller;

use CartoDbBundle\CartoDbServices;
use CartoDbBundle\Service\CartoDbApi;
use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\EnvironmentBundle\Strategy\GovwikiNamingStrategy;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Request;
use GovWiki\DbBundle\Entity\Government;

/**
 * Class GovernmentController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "/{environment}/government",
 *  requirements={ "environment": "\w+" }
 * )
 */
class GovernmentController extends AbstractGovWikiAdminController
{
    /**
     * Show list of governments for current environment.
     *
     * @Configuration\Route("/", methods="GET")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     *
     * @throws \LogicException Some required bundle not registered.
     */
    public function indexAction(Request $request)
    {
        $id = null;
        $name = null;
        if ($filter = $request->query->get('filter')) {
            if (!empty($filter['id'])) {
                $id = (int) $filter['id'];
            }
            if (!empty($filter['name'])) {
                $name = $filter['name'];
            }
        }

        $governments = $this->paginate(
            $this->getManager()
                ->getListQuery($id, $name),
            $request->query->getInt('page', 1),
            50
        );

        return [ 'governments' => $governments ];
    }

    /**
     * @Configuration\Route(
     *  "/{government}/edit",
     *  requirements={"government": "\d+"}
     * )
     * @Configuration\Template()
     *
     * @param Request    $request    A Request instance.
     * @param Government $government A Government instance.
     *
     * @return array
     *
     * @throws \InvalidArgumentException If entity is not supported.
     * @throws \LogicException Some required bundle not registered.
     */
    public function editAction(Request $request, Government $government)
    {
        $environment = $this->getCurrentEnvironment();

        $form = $this->createForm('government', $government);
        $form->handleRequest($request);

        // Store old slug's for for further updates.
        $oldSlug = CartoDbApi::escapeString($government->getSlug());
        $oldAltTypeSlug = CartoDbApi::escapeString($government->getAltTypeSlug());

        if ($form->isValid()) {
            // Escape updated fields.
            $newName = CartoDbApi::escapeString($government->getName());
            $newSlug = CartoDbApi::escapeString($government->getSlug());
            $newAltTypeSlug = CartoDbApi::escapeString($government->getAltTypeSlug());

            // Get dataset name.
            $dataset = GovwikiNamingStrategy::cartoDbDatasetName($environment);

            // Update CartoDB dataset.
            $response = $this->get(CartoDbServices::CARTO_DB_API)->sqlRequest("
                UPDATE {$dataset}
                SET
                    name = '{$newName}',
                    slug = '{$newSlug}',
                    alt_type_slug = '{$newAltTypeSlug}'
                WHERE
                    slug = '{$oldSlug}' AND
                    alt_type_slug = '{$oldAltTypeSlug}'
            ");

            if (array_key_exists('error', $response)) {
                // Display error received from CartoDB.

                $this->errorMessage("Can't update CartoDB: ". $response['error'][0]);
            } else {
                // Government successfully updated, save changes to our database.

                $this->getManager()->update($government);
                $this->successMessage('Government updated');

                return $this->redirectToRoute('govwiki_admin_government_edit', [
                    'environment' => $environment->getSlug(),
                    'government' => $government->getId(),
                ]);
            }
        }

        return [
            'government' => $government,
            'form' => $form->createView(),
            'availableYears' => $this->getGovernmentManager()
                ->getAvailableYears($environment, $government),
        ];
    }

    /**
     * @Configuration\Route(
     *  "/{government}/remove",
     *  requirements={ "government": "\d+" }
     * )
     *
     * @param Government $government A Government entity instance.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     *
     * @throws \LogicException Some required bundle not registered.
     */
    public function removeAction(Government $government)
    {
        $name = $government->getName();
        $environment = $this->getCurrentEnvironment();
        $dataset = GovwikiNamingStrategy::cartoDbDatasetName($environment);

        // Update carto db service.
        $this->get(CartoDbServices::CARTO_DB_API)
            ->sqlRequest("
                DELETE FROM {$dataset}
                WHERE alt_type_slug = '{$government->getAltTypeSlug()}' AND
                    slug = '{$government->getSlug()}'
            ");

        $this->getGovernmentManager()
            ->removeData($environment, $government->getId());

        $em = $this->getDoctrine()->getManager();
        $em->remove($government);
        $em->flush();

        $this->successMessage("Government {$name} removed");
        return $this->redirectToRoute('govwiki_admin_government_index', [
            'environment' => $environment->getSlug(),
        ]);
    }

    /**
     * @return \GovWiki\AdminBundle\Manager\Entity\AdminGovernmentManager
     */
    private function getManager()
    {
        return $this->get(GovWikiAdminServices::GOVERNMENT_MANAGER);
    }
}
