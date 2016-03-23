<?php

namespace GovWiki\AdminBundle\Controller;

use GovWiki\DbBundle\Entity\Government;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as Configuration;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Constraints\NotBlank;

/**
 * Class SubscribeController
 * @package GovWiki\AdminBundle\Controller
 *
 * @Configuration\Route(
 *  "/{government}/subscribe",
 *  requirements={ "governments": "\d+" }
 * )
 */
class SubscribeController extends AbstractGovWikiAdminController
{
    const MAX_PER_PAGE = 25;

    /**
     * @Configuration\Route("/")
     * @Configuration\Template()
     *
     * @param Request    $request    A Request instance.
     * @param Government $government A Government instance.
     *
     * @return array
     */
    public function indexAction(Request $request, Government $government)
    {
        $em = $this->getDoctrine()->getManager();
        $form = $this->createFormBuilder()
            ->add('message', 'textarea', [ 'constraints' => new NotBlank() ])
            ->getForm();

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $body = $form->getData()['message'];

            $chat = $government->getChat();
            $user = $this->getUser();
            $service_chat_message = $this->get('govwiki.user_bundle.chat_message');
            $user_email = $user->getEmail();
            $user_phone = $user->getPhone();

            // Save Twilio sms messages into base
            $phones = $service_chat_message->getChatMessageReceiversPhonesList($chat, $government, $user_phone);
            $sms_body = '
' . $body . '
From ' . $user_email;
            $service_chat_message->persistTwilioSmsMessages($phones, $this->getParameter('twilio.from'), $sms_body);

            // Save Email messages into base
            $emails = $service_chat_message->getChatMessageReceiversEmailList($chat, $government, $user_email);
            $env_admin_email = $government->getEnvironment()->getAdminEmail();
            $service_chat_message->persistEmailMessages(
                $emails,
                $env_admin_email,
                'New message in ' . $government->getName(),
                array(
                    'author' => $user_email,
                    'government_name' => $government->getName(),
                    'message_text' => $body
                )
            );

            $em->flush();

            $this->successMessage('Message sent to subscribers');

            return $this->redirectToRoute('govwiki_admin_subscribe_index', [
                'government' => $government->getId(),
            ]);
        }

        return [
            'form' => $form->createView(),
            'government' => $government,
            'subscribers' => $this->paginate(
                $em->getRepository('GovWikiUserBundle:User')
                    ->getGovernmentSubscribersQuery($government->getId()),
                $request->query->get('page', 1),
                self::MAX_PER_PAGE
            ),
        ];
    }
}
