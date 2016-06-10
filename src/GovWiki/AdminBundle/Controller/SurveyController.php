<?php

namespace GovWiki\AdminBundle\Controller;

use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use GovWiki\AdminBundle\Util\CsvIterator;
use GovWiki\DbBundle\Entity\Survey;
use GovWiki\EnvironmentBundle\Survey\Gateway\SurveyMonkeyGateway;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use GovWiki\EnvironmentBundle\GovWikiEnvironmentService;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

/**
 * Class SurveyController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "/{environment}/survey",
 *  requirements={ "environment": "\w+" }
 * )
 */
class SurveyController extends AbstractGovWikiAdminController
{
    /**
     * Survey list
     *
     * @Configuration\Route("/")
     * @Configuration\Template
     * @Configuration\Security("is_granted('ROLE_ADMIN')")
     *
     * @param Request $request A Request instance.
     *
     * @return array
     */
    public function indexAction(Request $request)
    {
        if ($this->getCurrentEnvironment() === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        $survey_list_response = $this->get(GovWikiEnvironmentService::SURVEY_MONKEY_GATEWAY)
            ->getList();
        $survey_list = $survey_list_response['data']['surveys'];

        $survey_list_pagination = $this->get('knp_paginator')->paginate(
            $survey_list,
            $request->query->getInt('page', 1),
            20
        );

        return [ 'survey_list' => $survey_list_pagination ];
    }

    /**
     * Survey show page
     *
     * @Configuration\Route("/{survey_id}/show")
     * @Configuration\Template
     * @Configuration\Security("is_granted('ROLE_ADMIN')")
     *
     * @param integer $survey_id Survey ID from SurveyMonkey.
     * @param Request $request   A Request instance.
     *
     * @return array
     */
    public function showAction($survey_id, Request $request)
    {
        $environment = $this->getCurrentEnvironment();

        if ($environment === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        // Get current survey details.
        $survey_details_response = $this->get(GovWikiEnvironmentService::SURVEY_MONKEY_GATEWAY)
            ->getDetails((string) $survey_id);
        $survey_title = $survey_details_response['data']['title']['text'];
        $survey_questions = $survey_details_response['data']['pages'][0]['questions'];

        // Create new survey.
        $survey = new Survey();
        $survey
            ->setEnvironment($environment)
            ->setTitle($survey_title)
            ->setSurveyId($survey_id);

        // Create survey form.
        $form = $this->createForm('survey', $survey);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            // Get elected emails.
            $emails_result = $em->getRepository('GovWikiDbBundle:ElectedOfficial')
                ->getEmailsByAltTypes($environment, $survey->getAltTypes());

            // todo: Only for tests.
            $emails_result = [
                [
                    'email' => 'freedemster@yandex.ru',
                    'custom_id' => '111',
                ],
                [
                    'email' => 'dmitriy.shemin@sibers.com',
                    'custom_id' => '222',
                ],
            ];

            $params = [
                'collector'=>[
                    'type'=>'email',
                    'send'=>true,
                    'name'=>'Email Invitation 2',
                    'recipients'=>$emails_result,
                ],
                'email_message'=>[
                    'reply_email' => $environment->getAdminEmail(),
                    'subject' => 'Survey for Elected Official',
                ],
            ];

            /** @var SurveyMonkeyGateway $surveyGateway */
            $surveyGateway = $this->get(GovWikiEnvironmentService::SURVEY_MONKEY_GATEWAY);

            $response = $surveyGateway->sendFlow((string) $survey_id, $params);
            if (! $response['success']) {
                $this->errorMessage('Can\'t send: '. $response['message']);
            } else {
                $this->successMessage('Surveys sent');
                $em->persist($survey);
                $em->flush();
            }

            return $this->redirect($request->getUri());
        }

        return [
            'form' => $form->createView(),
            'survey_title' => $survey_title,
            'survey_questions' => $survey_questions,
        ];
    }

    /**
     * @Configuration\Route("/{survey_id}/response_import")
     * @Configuration\Template
     *
     * @param Request $request   A Request instance.
     * @param string  $survey_id SurveyMonkey survey id.
     *
     * @return array
     */
    public function responseImportAction(Request $request, $survey_id)
    {
        $environment = $this->getCurrentEnvironment();

        if ($environment === null) {
            return $this->redirectToRoute('govwiki_admin_main_home');
        }

        // Create form.
        $form = $this->createFormBuilder(null, [
            'action' => $this->generateUrl('govwiki_admin_survey_responseimport', [
                'environment' => $environment->getSlug(),
                'survey_id' => $survey_id,
            ]),
        ])
            ->add('file', 'file')
            ->getForm();
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // Import response from csv file.
            $file = $form->getData()['file'];

            if ($file instanceof UploadedFile) {
                /** @var EntityRepository $repository */
                $repository = $this->getDoctrine()
                    ->getRepository('GovWikiDbBundle:Survey');

                $survey = $repository->findOneBy([ 'surveyId' => $survey_id ]);

                if (! $survey instanceof Survey) {
                    // If survey not in our database it means that we don't send
                    // request to specified survey.
                    $this->errorMessage('Responses not imported, survey not sent');

                    return $this->redirectToRoute('govwiki_admin_survey_index', [
                        'environment' => $environment->getSlug(),
                    ]);
                }

                /** @var Connection $connection */
                $connection = $this->getDoctrine()->getConnection();
                $iterator = new CsvIterator($file->getPathname());

                $deleteIds = [];
                $insertSql = [];
                foreach ($iterator->parse() as $row) {
                    // Get elected id and response date.
                    $electedId = $row['Custom Data'];
                    // TODO uncoment and use if need to store when response appear.
                    // $responseDate = $row['EndDate'];

                    // Remove useless columns.
                    unset(
                        $row['RespondentID'],
                        $row['CollectorID'],
                        $row['StartDate'],
                        $row['EndDate'],
                        $row['IP Address'],
                        $row['Email Address'],
                        $row['First Name'],
                        $row['LastName'],
                        $row['Custom Data']
                    );

                    $deleteIds[] = $electedId;
                    $insertSql[] = "({$survey->getId()},{$electedId},'".serialize($row)."')";
                }

                // Remove old responses.
                $connection->exec('
                    DELETE FROM `survey_responses`
                    WHERE elected_official_id in ('. implode(',', $deleteIds) .')
                ');

                // Insert.
                $connection->exec('
                    INSERT INTO `survey_responses`
                    (survey_id, elected_official_id, responses)
                    VALUES '. implode(',', $insertSql));

                $this->successMessage('Response imported');
                return $this->redirectToRoute('govwiki_admin_survey_index', [
                    'environment' => $environment->getSlug(),
                ]);
            }
        }

        return [ 'form' => $form->createView() ];
    }
}
