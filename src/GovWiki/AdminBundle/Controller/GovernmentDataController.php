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
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

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

                $error = CartoDbApi::getErrorFromResponse($response);
                if ($error) {
                    // Display error received from CartoDB.
                    $this->errorMessage("Can't update CartoDB: ". $error);
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

                // Get list of ranked field.
                $rankedFilterFn = function (array $format) {
                    return $format['ranked'];
                };
                $rankedFields = array_filter($formats, $rankedFilterFn);

                // Recalculate ranks.
                foreach ($rankedFields as $field) {
                    $this->getGovernmentManager()->calculateRanks($environment, $field);
                }

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
     *  "/{year}/edit",
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
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

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
            // Get new data.
            $newData = $form->getData();

            // Update government in our database.
            $this->getGovernmentManager()
                ->updateGovernmentData(
                    $environment,
                    $government,
                    $year,
                    $newData
                );

            // Get list of ranked field.
            $rankedFilterFn = function (array $format) {
                return $format['ranked'];
            };
            $rankedFields = array_filter($formats, $rankedFilterFn);

            // Get only those that are changed.
            $changedRankedFields = [];
            foreach ($rankedFields as $name => $field) {
                $oldValue = $data[$name];
                $newValue = $newData[$name];
                settype($oldValue, $field['type']);
                settype($newValue, $field['type']);

                if ($oldValue !== $newValue) {
                    $changedRankedFields[] = $field;
                }
            }

            // Recalculate ranks for changed ranked fields.
            foreach ($changedRankedFields as $field) {
                $this->getGovernmentManager()->calculateRanks($environment, $field);
            }

            // Remove max ranks table, max ranks values will be recalculated
            // on demand.
            $this->getMaxRankManager()->removeTable($environment);

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

                $error = CartoDbApi::getErrorFromResponse($response);
                if ($error) {
                    // Display error received from CartoDB.
                    $this->errorMessage("Can't update CartoDB: ". $error);
                    $allowUpdate = false;
                }
            }

            if ($allowUpdate) {
                // Dataset successfully updated.
                $this->successMessage('Government updated');

                return $this->redirectToRoute('govwiki_admin_governmentdata_edit', [
                    'environment' => $environment->getSlug(),
                    'government' => $government->getId(),
                    'year' => $year,
                ]);
            }
        }

        $formats = array_values($formats);
        return [
            'form' => $form->createView(),
            'formats' => Functions::groupBy($formats, [ 'tab_name', 'field' ]),
            'government' => $government,
            'year' => $year,
        ];
    }

    /**
     * @Configuration\Route(
     *  "/{year}/remove",
     *  requirements={ "year": "\d+" }
     * )
     *
     * @param Government $government A Government entity instance.
     * @param integer    $year       Data year.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function removeAction(Government $government, $year)
    {
        $environment = $this->getCurrentEnvironment();

        if ($environment === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $formats = $this->getFormatManager()
            ->getList($environment, $government->getAltType());
        // Remove extended data for specified year.
        $this->getGovernmentManager()
            ->removeData($environment, $government->getId(), $year);

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

            // Get list of ranked field.
            $rankedFilterFn = function (array $format) {
                return $format['ranked'];
            };
            $rankedFields = array_filter($formats, $rankedFilterFn);

            // Remove max ranks table, max ranks values will be recalculated
            // on demand.
            $this->getMaxRankManager()->removeTable($environment);

            // Recalculate ranks.
            foreach ($rankedFields as $field) {
                $this->getGovernmentManager()->calculateRanks($environment, $field);
            }

            if (array_key_exists('error', $response)) {
                // Display error received from CartoDB.
                $this->errorMessage("Can't update CartoDB: ". $response['error'][0]);
            } else {
                $this->successMessage("Data for {$year} deleted");
            }
        }

        return $this->redirectToRoute('govwiki_admin_government_edit', [
            'environment' => $environment->getSlug(),
            'government' => $government->getId(),
        ]);
    }
}
