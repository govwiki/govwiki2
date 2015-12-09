<?php

namespace GovWiki\AdminBundle\Controller;

use Doctrine\Common\Persistence\Mapping\MappingException;
use Doctrine\Common\Persistence\ObjectRepository;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Contribution;
use GovWiki\DbBundle\Entity\ElectedOfficial;
use GovWiki\DbBundle\Entity\ElectedOfficialVote;
use GovWiki\DbBundle\Entity\Endorsement;
use GovWiki\DbBundle\Entity\IssueCategory;
use GovWiki\DbBundle\Entity\Repository\ElectedOfficialRepository;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use GovWiki\DbBundle\Entity\CreateRequest;

/**
 * CreateRequestController
 */
class CreateRequestController extends Controller
{
    /**
     * @Route("/")
     * @Template
     *
     * @param Request $request
     * @return Response
     */
    public function indexAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();

        $createRequestsQuery = $em->createQuery(
            'SELECT cr FROM GovWikiDbBundle:CreateRequest cr
            LEFT JOIN cr.user u
            WHERE cr.status != :status
            ORDER BY cr.created DESC'
        )->setParameter('status', 'discarded');

        $createRequests = $this->get('knp_paginator')->paginate(
            $createRequestsQuery,
            $request->query->getInt('page', 1),
            50
        );

        return ['createRequests' => $createRequests];
    }

    /**
     * @Route("/{id}")
     * @Template
     *
     * @param CreateRequest $createRequest
     * @return Response
     */
    public function showAction(CreateRequest $createRequest)
    {
        $em = $this->getDoctrine()->getManager();
        $errors = [];

        try {
            $targetClassMetadata = $em->getClassMetadata("GovWikiDbBundle:{$createRequest->getEntityName()}");
        } catch (\Doctrine\Common\Persistence\Mapping\MappingException $e) {
            $targetClassMetadata = null;
            $errors[] = "Can't find entity with name '{$createRequest->getEntityName()}', due to bad entry or internal system error";
        }

        $data = $this->buildData($createRequest->getFields(), $targetClassMetadata);

        return [
            'createRequest' => $createRequest,
            'fields'        => $data['fields'],
            'associations'  => $data['associations'],
            'childs'        => $data['childs'],
            'errors'        => $errors,
        ];
    }

    /**
     * @Route("/{id}/apply")
     *
     * @param Request       $request       A Request instance.
     * @param CreateRequest $createRequest A CreateRequest instance.
     *
     * @return JsonResponse
     */
    public function applyAction(Request $request, CreateRequest $createRequest)
    {
        /** @var EntityManagerInterface $em */
        $em = $this->getDoctrine()->getManager();

        if (! $request->request->has('data')) {
            /*
             * If in request we don't get any data, ignore request and
             * redirect back to create request show page.
             */
            return new JsonResponse(
                [
                    'redirect' => $this->generateUrl(
                        'govwiki_admin_createrequest_show',
                        [
                            'id' => $createRequest->getId(),
                        ]
                    ),
                ]
            );
        }

        $this->persistData(
            $createRequest->getEntityName(),
            $request->request->get('data'),
            $em
        );

        $createRequest->setStatus('applied');

        /*
         * Send email notification to elected official.
         */
        if ($request->request->has('emailFlags')) {
            /*
             * Get all elected officials id for who send email flag is set.
             */
            $ids = [];
            foreach ($request->request->get('emailFlags') as $id => $isSend) {
                if ('true' === $isSend) {
                    $ids[] = $id;
                }
            }

            if (count($ids) > 0) {
                /** @var ElectedOfficialRepository $repository */
                $repository = $this->getDoctrine()->getRepository('GovWikiDbBundle:ElectedOfficial');

                $data = $repository->getDataForEmailByIds($ids);

                /*
                 * Send emails.
                 */
                /** @var \Swift_Mailer $mailer */
                $mailer = $this->get('mailer');

                $type = 'public statement';
                if ($createRequest->getEntityName() === 'Legislation') {
                    $type = 'vote';
                }

                foreach ($data as $row) {
                    $message = \Swift_Message::newInstance();
                    if ($this->getParameter('debug')) {
                        $message->setTo('user1@mail1.dev');
                    } else {
                        $message->setTo($row['emailAddress']);
                    }

                    $message
                        ->setSubject($this->getParameter('email_subject'))
                        ->setFrom($this->getParameter('admin_email'))
                        ->setBody(
                            $this->renderView(
                                'GovWikiAdminBundle::email.html.twig',
                                [
                                    'full_name' => $row['fullName'],
                                    'title' => $row['title'],
                                    'type' => $type,
                                    'email' => $this->getParameter('admin_email'),
                                    'government_name' => $row['name'],
                                    'governments_slug' => $row['slug'],
                                ]
                            ),
                            'text/html'
                        );

                    $mailer->send($message);
                }
            }
        }

        /*
         * Update CreateRequest entity.
         */
        $createRequest->setFields($request->request->get('data'));
        $em->persist($createRequest);

        $em->flush();

        return new JsonResponse(['redirect' => $this->generateUrl('govwiki_admin_createrequest_index')]);
    }

    /**
     * @Route("/{id}/discard")
     *
     * @param CreateRequest $createRequest
     * @return JsonResponse
     */
    public function discardAction(CreateRequest $createRequest)
    {
        $em = $this->getDoctrine()->getManager();
        $createRequest->setStatus('discarded');
        $em->flush();

        return new JsonResponse(['redirect' => $this->generateUrl('govwiki_admin_createrequest_index')]);
    }

    /**
     * @Route("/{id}/remove")
     *
     * @param CreateRequest $createRequest A CreateRequest instance.
     *
     * @return JsonResponse
     */
    public function removeAction(CreateRequest $createRequest)
    {
        $em = $this->getDoctrine()->getManager();
        $em->remove($createRequest);
        $em->flush();

        return new JsonResponse(['status' => 'ok']);
    }

    /**
     * @param array         $data                Entity data.
     * @param ClassMetadata $targetClassMetadata Entity class metadata.
     *
     * @return array
     */
    private function buildData(array $data, ClassMetadata $targetClassMetadata)
    {
        static $associationCache = [];

        $em = $this->getDoctrine()->getManager();
        $newEntity = $targetClassMetadata->newInstance();

        $result['fields'] = [];
        foreach ($data['fields'] as $field => $value) {
            $correctField = true;
            $setter = 'set'.ucfirst($field);

            if (!method_exists($newEntity, $setter)) {
                $correctField = false;
            }

            $fields = [
                'field'   => $field,
                'value'   => $value,
                'correct' => $correctField,
            ];
            if (($newEntity instanceof Contribution) &&
                ('contributorType' === $field)) {
                $fields['choices'] = [
                    'Candidate Committee' => 'Candidate Committee',
                    'Corporate' => 'Corporate',
                    'Individual' => 'Individual',
                    'Political Party' => 'Political Party',
                    'Political Action Committee' => 'Political Action Committee',
                    'Self' => 'Self',
                    'Union' => 'Union',
                    'Other' => 'Other',
                ];
            } elseif (($newEntity instanceof Endorsement) &&
                ('endorserType' === $field)) {
                $fields['choices'] = [
                    'Elected Official' => 'Elected Official',
                    'Organization' => 'Organization',
                    'Political Party' => 'Political Party',
                    'Union' => 'Union',
                    'Other' => 'Other',
                ];
            } elseif (($newEntity instanceof ElectedOfficialVote)) {
                if ('vote' === $field) {
                    $fields['choices'] = [
                        'Yes' => 'Yes',
                        'No' => 'No',
                        'Abstain' => 'Abstain',
                        'Absence' => 'Absence',
                        'Not in Office' => 'Not in Office',
                    ];
                } elseif ('didElectedOfficialProposeThis' === $field) {
                    $fields['choices'] = [
                        'Yes' => 'Yes',
                        'No' => 'No',
                    ];
                }
            }

            $result['fields'][] = $fields;
        }

        $result['associations'] = [];
        foreach ($data['associations'] as $association => $id) {
            $correctAssociation = true;
            $associationName    = '';
            try {
                /** @var ObjectRepository $associationRepository */
                $associationRepository = $em->getRepository("GovWikiDbBundle:{$association}");
            } catch (MappingException $e) {
                $associationRepository = null;
                $correctAssociation = false;
            }

            $associationData = [];
            if ($correctAssociation) {
                $associationEntity = $associationRepository->find($id);
                if ($associationEntity) {
                    if (method_exists($associationEntity, '__toString')) {
                        $associationName = (string) $associationEntity;
                    } else {
                        $associationName = 'Can\'t display name';
                    }
                } else {
                    $correctAssociation = false;
                }

                /*
                 * Get associated entity id.
                 */
                $associationData = [
                    'id' => $associationEntity->getId(),
                ];
                if ($associationEntity instanceof IssueCategory) {
                    /*
                     * Get association choices.
                     */
                    if (empty($associationCache[$association])) {
                        $tmp = $associationRepository->findAll();
                        foreach ($tmp as $entity) {
                            if (method_exists($associationEntity, '__toString')) {
                                $associationCache[$association][$entity->getId()] = (string) $entity;
                            } else {
                                $associationCache[$association][$entity->getId()] = 'Can\'t display name';
                            }
                        }
                    }

                    $associationData['choices'] = $associationCache[$association];
                }
            }
            $associationData['field'] = $association;
            $associationData['name'] = $associationName;
            $associationData['correct'] = $correctAssociation;

            $result['associations'][] = $associationData;
        }

        $result['childs'] = [];
        if (!empty($data['childs'])) {
            foreach ($data['childs'] as $child) {
                try {
                    $childClassMetadata = $em->getClassMetadata("GovWikiDbBundle:{$child['entityName']}");
                } catch (MappingException $e) {
                    $childClassMetadata = null;
                    $errors[] = "Can't find entity with name '{$child['entityName']}', due to bad entry or internal system error";
                }

                if (empty($errors)) {
                    $result['childs'][] = $this->buildData($child['fields'], $childClassMetadata) + ['dataType' => $child['entityName']];
                }
            }
        }

        return $result;
    }

    /**
     * @param string                 $entityName Persisted entity name.
     * @param array                  $data       Persisted data.
     * @param EntityManagerInterface $em         A EntityManagerInterface instance.
     *
     * @return object
     */
    private function persistData($entityName, array $data, EntityManagerInterface $em)
    {
        /** @var ClassMetadata $targetClassMetadata */
        $targetClassMetadata = $em->getClassMetadata("GovWikiDbBundle:$entityName");
        $newEntity = $targetClassMetadata->newInstance();

        if (!empty($data['fields'])) {
            foreach ($data['fields'] as $field => $value) {
//                $correctField = true;
                $setter = 'set'.ucfirst($field);

                if (method_exists($newEntity, $setter)) {
                    if ($targetClassMetadata->getFieldMapping($field)['type'] == 'date') {
                        $newEntity->$setter(new \Datetime($value));
                    } else {
                        $newEntity->$setter($value);
                    }
                }
            }
        }

        if (!empty($data['associations'])) {
            foreach ($data['associations'] as $association => $id) {
                $correctAssociation = true;
//                $associationName    = '';
                try {
                    /** @var ObjectRepository $associationRepository */
                    $associationRepository = $em->getRepository("GovWikiDbBundle:{$association}");
                } catch (MappingException $e) {
                    $associationRepository = null;
                    $correctAssociation = false;
                }

                if ($correctAssociation) {
                    $associationEntity = $associationRepository->find($id);
                    if ($associationEntity) {
                        $associationSetter = 'set'.ucfirst($association);
                        $newEntity->$associationSetter($associationEntity);
                    }
                }
            }
        }

        if (!empty($data['childs'])) {
            foreach ($data['childs'] as $child) {
                $adder = 'add'.$child['entityName'];

                if (method_exists($newEntity, $adder)) {
                    $child = $this->persistData($child['entityName'], $child['fields'], $em);
                    $em->persist($child);
                    $newEntity->$adder($child);
                }
            }
        }

        $em->persist($newEntity);

        return $newEntity;
    }
}
