<?php

namespace GovWiki\AdminBundle\Controller;

use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;
use GovWiki\AdminBundle\GovWikiAdminServices;
use GovWiki\DbBundle\Entity\FinData;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\File\CsvReader;
use GovWiki\DbBundle\GovWikiDbServices;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;

/**
 * Class FinDataController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route("/fin_statements")
 */
class FinDataController extends AbstractGovWikiAdminController
{

    const LIMIT = 25;

    /**
     * @Configuration\Route(
     *  "/{government}",
     *  requirements={ "government": "\d+" }
     * )
     * @Configuration\Template()
     *
     * @param Request    $request    A Request instance.
     * @param Government $government A Government instance.
     *
     * @return array
     *
     * @throws NonUniqueResultException If the query result is not unique.
     * @throws NoResultException If the query returned no result.
     */
    public function indexAction(Request $request, Government $government)
    {
        $filter = $request->query->get('filter', []);

        $year = null;
        if (array_key_exists('year', $filter)) {
            $year = (int) $filter['year'];
        }

        $finDataQuery = $this->getManager()
            ->getListQuery($government->getId(), $year);

        return [
            'fin_data' => $this->paginate(
                $finDataQuery,
                $request->query->getInt('page', 1),
                self::LIMIT
            ),
            'years' => $this->getManager()->getYears($government->getId()),
            'government' => $government,
        ];
    }

    /**
     * @Configuration\Route(
     *  "/{finData}/edit",
     *  requirements={ "finData": "\d+" }
     * )
     * @Configuration\Template()
     *
     * @Configuration\ParamConverter(
     *  "finData",
     *  class="GovWiki\DbBundle\Entity\FinData",
     *  options={
     *      "repository_method": "get"
     *  }
     * )
     *
     * @param Request $request A Request instance.
     * @param FinData $finData A FinData instance.
     *
     * @return array
     */
    public function editAction(Request $request, FinData $finData)
    {
        $form = $this->createForm('fin_data', $finData);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $em->persist($finData);
            $em->flush();
        }

        return [ 'form' => $form->createView() ];
    }

    /**
     * @Configuration\Route("/import/{environment}")
     * @Configuration\Template()
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function importAction(Request $request)
    {
        $form = $this->createFormBuilder(null, [
            'action' => $this->generateUrl(
                'govwiki_admin_findata_import',
                [ 'environment' => $this->getManager()->getEnvironment() ]
            ),
        ])
            ->add('csv_file', 'file')
            ->getForm();

        $form->handleRequest($request);
        if ($form->isSubmitted()) {
            if ($form->isValid()) {
                /** @var UploadedFile $file */
                $file = $form->getData()['csv_file'];

                $filePath = $file->getPathname();

                try {
                    $this->get(GovWikiDbServices::FIN_DATA_IMPORTER)
                        ->import(new CsvReader($filePath));
                } catch (\Exception $e) {
                    $this->errorMessage('Can\'t import new financial statements');
                    return $this->redirectToRoute('govwiki_admin_government_index');
                }

                $this->successMessage('Financial statements imported successfully');

                return $this->redirectToRoute('govwiki_admin_government_index');
            }

            $this->errorMessage('Can\'t import new financial statements');
        }

        return [ 'form' => $form->createView() ];
    }

    /**
     * @return \GovWiki\AdminBundle\Manager\Entity\AdminFinDataManager
     */
    private function getManager()
    {
        return $this->get(GovWikiAdminServices::FIN_DATA_MANAGER);
    }
}
