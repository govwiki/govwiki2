<?php

namespace GovWiki\ApiBundle\Controller\V1;

use GovWiki\DbBundle\Entity\Message;
use GovWiki\UserBundle\Entity\User;
use GovWiki\DbBundle\Entity\Chat;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Entity\TwilioSmsMessages;
use GovWiki\DbBundle\Entity\EmailMessage;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class TwilioSmsController
 * @package GovWiki\ApiBundle\Controller
 *
 * @Route("/sms")
 */
class TwilioSmsController extends Controller
{
    /**
     * Receive incoming sms messages.
     *
     * @param Request $request
     *
     * @Route(path="/receive")
     *
     * @return Response
     */
    public function receiveAction(Request $request)
    {
        $fromNumber = $request->request->get('From');
        $smsBody = $request->request->get('Body');

        $em = $this->getDoctrine()->getManager();
        $sms_sender = $em->getRepository('GovWikiUserBundle:User')->findOneBy(array(
            'phone' => $fromNumber
        ));
        if (!$sms_sender) {
            return new Response(null, 404);
        }

        $government = null;
        $governments = $sms_sender->getSubscribers();
        if (!$governments) {
            return new Response(null, 404);
        } else {
            $government = $governments[0];
        }

        $chat = null;
        if ($government) {
            /** @var Government $government */
            /** @var Chat $chat */
            $chat = $government->getChat();
        }
        if (!$chat) {
            return new Response(null, 404);
        }

        if ($this->isMember($chat, $sms_sender->getId())) {
            $new_message = new Message();
            $new_message->setChat($chat);
            $new_message->setText($smsBody);
            $new_message->setAuthor($sms_sender);
            $em->persist($new_message);

            // Save Twilio sms messages into base
            $phones = $this->getPhones($em, $chat, $government, $sms_sender);
            foreach ($phones as $phone) {
                $twilioSmsMessage = new TwilioSmsMessages();
                $twilioSmsMessage->setFromNumber($this->getParameter('twilio.from'));
                $twilioSmsMessage->setToNumber($phone);
                $twilioSmsMessage->setMessage('
' . $new_message->getText() . '
From ' . $sms_sender->getEmail());
                $em->persist($twilioSmsMessage);
            }

            // Save Email messages into base
            $emails = $this->getEmails($em, $chat, $government, $sms_sender);
            $env_admin_email = $government->getEnvironment()->getAdminEmail();
            foreach ($emails as $email) {
                $emailMessage = new EmailMessage();
                $emailMessage->setFromEmail($env_admin_email);
                $emailMessage->setToEmail($email);
                $emailMessage->setSubject('New message in ' . $government->getName());
                $emailMessage->setMessage($this->renderView('GovWikiFrontendBundle:Government:chatMessageEmail.html.twig', array(
                    'recipient' => $email,
                    'author' => $sms_sender->getEmail(),
                    'government_name' => $government->getName(),
                    'message_text' => $new_message->getText()
                )));
                $em->persist($emailMessage);
            }

            $em->flush();
        }

        return new Response();
    }

    /**
     * @param Chat $chat Chat entity
     * @param integer $user_id User's ID
     *
     * @return boolean
     */
    private function isMember($chat, $user_id)
    {
        $members = $chat->getMembers();
        foreach ($members as $member) {
            if ($member->getId() == $user_id) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param EntityManager $em Entity Manager
     * @param Chat $chat Chat
     * @param Government $government Current government
     * @param User $author Sms author
     *
     * @return array
     */
    private function getPhones($em, $chat, $government, $author)
    {
        $phones = array();

        $members = $chat->getMembers();
        /** @var User $member */
        foreach ($members as $member) {
            $member_phone = $member->getPhone();
            if ($member_phone != $author->getPhone() && !empty($member_phone)) {
                $phones[] = $member_phone;
            }
        }

        $env = $government->getEnvironment();
        $env_users = $env->getUsers();
        /** @var User $user */
        foreach ($env_users as $user) {
            $user_phone = $user->getPhone();
            if ($user_phone != $author->getPhone() && $user->hasRole('ROLE_MANAGER') && !empty($user_phone)) {
                $phones[] = $user_phone;
            }
        }

        $admins_list = $em->getRepository('GovWikiUserBundle:User')->getAdminsList();
        /** @var User $admin */
        foreach ($admins_list as $admin) {
            $admin_phone = $admin->getPhone();
            if ($admin_phone != $author->getPhone() && !empty($admin_phone)) {
                $phones[] = $admin_phone;
            }
        }

        return array_unique($phones);
    }

    /**
     * @param EntityManager $em Entity Manager
     * @param Chat $chat Chat
     * @param Government $government Current government
     * @param User $author Sms author
     *
     * @return array
     */
    private function getEmails($em, $chat, $government, $author)
    {
        $emails = array();

        $members = $chat->getMembers();
        /** @var User $member */
        foreach ($members as $member) {
            if ($member->getEmail() != $author->getEmail()) {
                $emails[] = $member->getEmail();
            }
        }

        $env = $government->getEnvironment();
        $env_users = $env->getUsers();
        /** @var User $user */
        foreach ($env_users as $user) {
            if ($user->hasRole('ROLE_MANAGER') && $user->getEmail() != $author->getEmail()) {
                $emails[] = $user->getEmail();
            }
        }

        $admins_list = $em->getRepository('GovWikiUserBundle:User')->getAdminsList();
        /** @var User $admin */
        foreach ($admins_list as $admin) {
            if ($admin->getEmail() != $author->getEmail()) {
                $emails[] = $admin->getEmail();
            }
        }

        return array_unique($emails);
    }
}
