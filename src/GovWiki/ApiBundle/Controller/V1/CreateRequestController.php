<?php

namespace GovWiki\ApiBundle\Controller\V1;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Mapping\ClassMetadataInfo;
use JMS\Serializer\SerializationContext;
use JMS\Serializer\Serializer;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\PropertyAccess\PropertyAccess;

/**
 * Class CreateRequestController
 * @package GovWiki\ApiBundle\Controller\V1
 *
 * @Route("/create-request")
 */
class CreateRequestController extends AbstractGovWikiApiController
{

    /**
     * @Route("/create")
     *
     * @param Request $request A Request instance.
     *
     * @return Response|JsonResponse
     */
    public function createAction(Request $request)
    {
        if ($request->isXmlHttpRequest()) {
            if ($this->getUser() and $this->getUser()->hasRole('ROLE_USER')) {
                $data = $request->request->get('createRequest');

//                $environment = $this->getCurrentEnvironment();
//                $entity = $this
//                    ->get(GovWikiDbServices::CREATE_REQUEST_MANAGER)
//                    ->process(
//                        $data,
//                        $environment
//                    );
//                $em = $this->getDoctrine()->getManager();
//                $em->persist($entity);
//                $em->flush();

                // Add entity right to database.
                /** @var EntityManagerInterface $em */
                $em = $this->getDoctrine()->getManager();

                $metadata = $em->getClassMetadata('GovWikiDbBundle:'. $data['entityName']);
                if ($metadata instanceof ClassMetadataInfo) {
                    /** @var Serializer $serializer */
                    $serializer = $this->get('jms_serializer');

                    // Process fields and associations.
                    // Copy all fields from request.
                    $fields = $data['fields']['fields'];

                    // Iterate through specified associations and create proper
                    // entity references.
                    if (array_key_exists('associations', $data['fields'])) {
                        foreach ($data['fields']['associations'] as $name => $id) {
                            $name = ucfirst($name);
                            $entityName = 'GovWikiDbBundle:'. $name;
                            $fields[$name] = $em->getReference($entityName, $id);
                        }
                    }

                    // Create new entity instance.
                    $entity = $metadata->newInstance();

                    // Set entity fields value.
                    $accessor = PropertyAccess::createPropertyAccessor();
                    foreach ($fields as $name => $value) {
                        $accessor->setValue($entity, $name, $value);
                    }

                    // Persist new entity.
                    $em->persist($entity);
                    $em->flush();

                    // Serialize entity and send back to client.
                    $context = SerializationContext::create()
                        ->setGroups('api');
                    $entity = $serializer->serialize($entity, 'json', $context);
                    return new Response($entity);
                }
            } else {
                return new Response(null, 401);
            }
        }

        return new Response(null, 400);
    }
}
