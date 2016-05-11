<?php

namespace GovWiki\AdminBundle\Controller;

use CartoDbBundle\CartoDbServices;
use CartoDbBundle\Service\CartoDbApi;
use GovWiki\DbBundle\Form\ExtGovernmentType;
use GovWiki\DbBundle\Utils\Functions;
use GovWiki\EnvironmentBundle\Strategy\GovwikiNamingStrategy;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Request;
use GovWiki\DbBundle\Entity\Government;

/**
 * Class GovernmentDataController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "/{environment}/government/{government}/data",
 *  requirements={
 *    "environment": "\w+",
 *    "government": "\d+"
 *  }
 * )
 */
class GovernmentDataController extends AbstractGovWikiAdminController
{

    /**
     * @Configuration\Route("/new")
     * @Configuration\Template()
     *
     * @param Request    $request    A Request instance.
     * @param Government $government A Government entity instance.
     *
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function newAction(Request $request, Government $government)
    {
        $environment = $this->getCurrentEnvironment();
        $formats = $this->getFormatManager()
            ->getList($environment, $government->getAltType());
        $form = $this->createForm('new_ext_government', null, [
            'government' => $government,
        ]);
        $allowCreate = true;

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $data = $form->getData();
            $year = $data['year'];

            // Collect coloring conditions data for given government and update
            // CartoDB dataset, if it's need.
            $conditions = $environment->getMap()->getColoringConditions();

            if ($conditions->isColorized()) {
                // Escape government slug and altTypeSlug for CartoDB.
                $slug = CartoDbApi::escapeString($government->getSlug());
                $altTypeSlug = CartoDbApi::escapeString($government->getAltTypeSlug());

                // Condition field name.
                $conditionField = $conditions->getFieldName();

                // Get condition field values for current government.
                $values = $this->getGovernmentManager()
                    ->getConditionValuesForGovernment(
                        $environment,
                        $government->getId(),
                        $conditionField
                    );

                // Format values.
                $conditionValues = [];
                foreach ($values as $row) {
                    $conditionValues[$row['year']] = (float) $row['data'];
                }
                // Add new value.
                $conditionValues[$year] = (float) $data[$conditionField];
                $dataJson = json_encode($conditionValues);

                // Get dataset name.
                $dataset = GovwikiNamingStrategy::cartoDbDatasetName($environment);

                // Update CartoDB dataset.
                $response = $this->get(CartoDbServices::CARTO_DB_API)->sqlRequest("
                    UPDATE {$dataset}
                    SET data_json = '{$dataJson}'
                    WHERE
                        slug = '{$slug}' AND
                        alt_type_slug = '{$altTypeSlug}'
                ");

                if (array_key_exists('error', $response)) {
                    // Display error received from CartoDB.
                    $this->errorMessage("Can't update CartoDB: ". $response['error'][0]);
                    $allowCreate = false;
                }
            }

            if ($allowCreate) {
                // Update db.
                $this->getGovernmentManager()->persistGovernmentData(
                    $environment,
                    $government,
                    $data
                );

                // Remove max ranks table, max ranks values will be recalculated
                // on demand.
                $this->getMaxRankManager()->removeTable($environment);

                return $this->redirectToRoute('govwiki_admin_governmentdata_edit', [
                    'environment' => $environment->getSlug(),
                    'government' => $government->getId(),
                    'year' => $year,
                ]);
            }
        }

        return [
            'form' => $form->createView(),
            'errors' => $form->getErrors(),
            'formats' => Functions::groupBy($formats, [ 'tab_name', 'field' ]),
            'government' => $government,
        ];
    }

    /**
     * Edit extended government fields for selected year.
     *
     * @Configuration\Route(
     *  "/{year}",
     *  requirements={ "year": "\d+" }
     * )
     * @Configuration\Template()
     *
     * @param Request    $request    A Request instance.
     * @param Government $government A Government entity instance.
     * @param integer    $year       Data year.
     *
     * @return array
     *
     * @throws \LogicException Some required bundle not registered.
     */
    public function editAction(
        Request $request,
        Government $government,
        $year
    ) {
        $environment = $this->getCurrentEnvironment();
        $allowUpdate = true;

        $data = $this->getGovernmentManager()->getEnvironmentRelatedData(
            $environment,
            $government->getId(),
            $year
        );

        $formats = $this->getFormatManager()
            ->getList($environment, $government->getAltType());
        $form = $this->createForm('ext_government', $data, [
            'government' => $government,
        ]);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // Collect coloring conditions data for given government and update
            // CartoDB dataset, if it's need.
            $conditions = $environment->getMap()->getColoringConditions();

            if ($conditions->isColorized()) {
                // Escape government slug and altTypeSlug for CartoDB.
                $slug = CartoDbApi::escapeString($government->getSlug());
                $altTypeSlug = CartoDbApi::escapeString($government->getAltTypeSlug());

                // Get condition field values for current government.
                $values = $this->getGovernmentManager()
                    ->getConditionValuesForGovernment(
                        $environment,
                        $government->getId(),
                        $conditions->getFieldName()
                    );

                // Format values.
                $data = [];
                foreach ($values as $row) {
                    $data[$row['year']] = (float) $row['data'];
                }
                $dataJson = json_encode($data);

                // Get dataset name.
                $dataset = GovwikiNamingStrategy::cartoDbDatasetName($environment);

                // Update CartoDB dataset.
                $response = $this->get(CartoDbServices::CARTO_DB_API)->sqlRequest("
                    UPDATE {$dataset}
                    SET data_json = '{$dataJson}'
                    WHERE
                        slug = '{$slug}' AND
                        alt_type_slug = '{$altTypeSlug}'
                ");

                if (array_key_exists('error', $response)) {
                    // Display error received from CartoDB.
                    $this->errorMessage("Can't update CartoDB: ". $response['error'][0]);
                    $allowUpdate = false;
                }
            }

            if ($allowUpdate) {
                // Update government in our database.
                $this->getGovernmentManager()
                    ->updateGovernmentData(
                        $environment,
                        $government,
                        $year,
                        $form->getData()
                    );

                // Remove max ranks table, max ranks values will be recalculated
                // on demand.
                $this->getMaxRankManager()->removeTable($environment);

                // Dataset successfully updated.
                $this->successMessage('Government updated');

                return $this->redirectToRoute('govwiki_admin_governmentdata_edit', [
                    'environment' => $environment->getSlug(),
                    'government' => $government->getId(),
                    'year' => $year,
                ]);
            }
        }

        return [
            'form' => $form->createView(),
            'formats' => Functions::groupBy($formats, [ 'tab_name', 'field' ]),
            'government' => $government,
            'year' => $year,
        ];
    }
}
