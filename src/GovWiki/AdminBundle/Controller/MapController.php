<?php

namespace GovWiki\AdminBundle\Controller;

use CartoDbBundle\CartoDbServices;
use CartoDbBundle\Service\CartoDbApi;
use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\AdminBundle\Manager\AdminEnvironmentManager;
use GovWiki\DbBundle\Doctrine\Type\ColorizedCountyCondition\ColorizedCountyConditions;
use GovWiki\DbBundle\Entity\Map;
use GovWiki\DbBundle\Form\MapType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
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

            $data = $request->request->get('ccc');

            if (array_key_exists('colorized', $data)) {
                $data['colorized'] = true;
                $conditions = ColorizedCountyConditions::fromArray($data);
                $values = $this->adminEnvironmentManager()
                    ->getGovernmentsFiledValues($conditions->getFieldName());
                $environment = $this->adminEnvironmentManager()
                    ->getEnvironment();

                $values = array_map(
                    function (array $row) {
                        $data = explode(',', $row['data']);
                        $data = array_map(
                            function ($element) { return (float) $element; },
                            $data
                        );
                        $years = explode(',', $row['years']);

                        unset($row['years']);
                        $row['data'] = json_encode(array_combine($years, $data));
                        return $row;
                    },
                    $values
                );

                /*
                 * Prepare sql parts for CartoDB sql request.
                 */
                $sqlParts = [];
                foreach ($values as $row) {
                    if (null === $row['data']) {
                        $row['data'] = 'null';
                    }

                    $slug = CartoDbApi::escapeString($row['slug']);
                    $altTypeSlug = CartoDbApi::escapeString($row['alt_type_slug']);
                    $data = $row['data'];

                    $sqlParts[] = "
                        ('{$slug}', '{$altTypeSlug}', '{$data}')
                    ";
                }


                $api = $this->get(CartoDbServices::CARTO_DB_API);
                $api
                    // Create temporary dataset.
                    ->createDataset($environment.'_temporary', [
                        'alt_type_slug' => 'VARCHAR(255)',
                        'slug' => 'VARCHAR(255)',
                        'data_json' => 'VARCHAR(255)',
                    ], true)
                    ->sqlRequest("
                        INSERT INTO {$environment}_temporary
                            (slug, alt_type_slug, data_json)
                        VALUES ". implode(',', $sqlParts));
                    // Update concrete environment dataset from temporary
                    // dataset.
                $api->sqlRequest("
                    UPDATE {$environment} e
                    SET data_json = t.data_json
                    FROM {$environment}_temporary t
                    WHERE e.slug = t.slug AND
                        e.alt_type_slug = t.alt_type_slug
                ");
                    // Remove temporary dataset.
                $api->dropDataset($environment.'_temporary');
            } else {
                $data['colorized'] = false;
                $conditions = ColorizedCountyConditions::fromArray($data);
            }


            $map->setColorizedCountyConditions($conditions);
            $em->persist($map);
            $em->flush();
        }

        return [
            'form' => $form->createView(),
            'conditions' => $map->getColorizedCountyConditions(),
            'fields' => $this
                ->get(GovWikiAdminServices::ADMIN_ENVIRONMENT_MANAGER)
                ->getGovernmentFields(),
        ];
    }
}
