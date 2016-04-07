<?php

namespace GovWiki\UserBundle\Service;

use GovWiki\DbBundle\Entity\Chat;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Entity\EmailMessage;
use GovWiki\DbBundle\Entity\TwilioSmsMessages;
use GovWiki\UserBundle\Entity\User;
use Doctrine\ORM\EntityManager;

/**
 * Class ChatMessage
 * @package GovWiki\UserBundle\Service
 */
class ChatMessage
{
    /**
     * @var EntityManager
     */
    private $em;

    /**
     * @var object
     */
    private $templating;

    /**
     * @param EntityManager $em
     * @param object $templating
     */
    public function __construct($em, $templating)
    {
        $this->em = $em;
        $this->templating = $templating;
    }

    /**
     * Get chat message receivers email list
     *
     * @param Chat $chat
     * @param Government $government
     * @param string $author_email
     * @param boolean $is_author_admin
     *
     * @return array
     */
    public function getChatMessageReceiversEmailList($chat, $government, $author_email, $is_author_admin = false)
    {
        $emails = array();

        // Add to $emails array emails of Chat members.
        $members = $chat->getMembers();
        /** @var User $member */
        foreach ($members as $member) {
            $member_email = $member->getEmail();
            if ($member_email != $author_email) {
                $emails[] = $member_email;
            }
        }

        if (!$is_author_admin) {
            $emails[] = $government->getEnvironment()->getAdminEmail();
        }

        // Add to $emails array emails of environment managers.
        /*$env = $government->getEnvironment();
        $env_users = $env->getUsers();
        /** @var User $env_user */
        /*foreach ($env_users as $env_user) {
            $env_user_email = $env_user->getEmail();
            if ($env_user->hasRole('ROLE_MANAGER') && $env_user_email != $author_email) {
                $emails[] = $env_user_email;
            }
        }*/

        // Add to $emails array emails of admins.
        /*$admins_list = $this->em->getRepository('GovWikiUserBundle:User')->getAdminsList();*/
        /** @var User $admin */
        /*foreach ($admins_list as $admin) {
            $admin_email = $admin->getEmail();
            if ($admin_email != $author_email) {
                $emails[] = $admin_email;
            }
        }*/

        return array_unique($emails);
    }

    /**
     * Get chat message receivers phones list
     *
     * @param Chat $chat
     * @param Government $government
     * @param string $author_phone
     *
     * @return array
     */
    public function getChatMessageReceiversPhonesList($chat, $government, $author_phone)
    {
        $phones = array();

        $members = $chat->getMembers();
        /** @var User $member */
        foreach ($members as $member) {
            $member_phone = $member->getPhone();
            if ($member_phone != $author_phone && !empty($member_phone)) {
                $phones[] = $member_phone;
            }
        }

        /*$env = $government->getEnvironment();
        $env_users = $env->getUsers();*/
        /** @var User $user */
        /*foreach ($env_users as $user) {
            $user_phone = $user->getPhone();
            if ($user_phone != $author_phone && $user->hasRole('ROLE_MANAGER') && !empty($user_phone)) {
                $phones[] = $user_phone;
            }
        }*/

        /*$admins_list = $this->em->getRepository('GovWikiUserBundle:User')->getAdminsList();*/
        /** @var User $admin */
        /*foreach ($admins_list as $admin) {
            $admin_phone = $admin->getPhone();
            if ($admin_phone != $author_phone && !empty($admin_phone)) {
                $phones[] = $admin_phone;
            }
        }*/

        return array_unique($phones);
    }

    /**
     * Create and persist EmailMessage objects.
     *
     * @param array $toEmailsList
     * @param string $fromEmail
     * @param string $subject
     * @param array $message_options
     *
     * @return null
     */
    public function persistEmailMessages($toEmailsList, $fromEmail, $subject, $message_options)
    {
        foreach ($toEmailsList as $toEmail) {
            $emailMessage = new EmailMessage();
            $emailMessage->setFromEmail($fromEmail);
            $emailMessage->setToEmail($toEmail);
            $emailMessage->setSubject($subject);
            $emailMessage->setMessage($this->templating->render('GovWikiFrontendBundle:Government:chatMessageEmail.html.twig',
                array_merge(array('recipient' => $toEmail), $message_options)
            ));
            $this->em->persist($emailMessage);
        }

        return null;
    }

    /**
     * Create and persist TwilioSmsMessages objects.
     *
     * @param array $toPhonesList
     * @param string $fromPhone
     * @param string $sms_body
     *
     * @return null
     */
    public function persistTwilioSmsMessages($toPhonesList, $fromPhone, $sms_body)
    {
        foreach ($toPhonesList as $toPhone) {
            $twilioSmsMessage = new TwilioSmsMessages();
            $twilioSmsMessage->setFromNumber($fromPhone);
            $twilioSmsMessage->setToNumber($toPhone);
            $twilioSmsMessage->setMessage($sms_body);
            $this->em->persist($twilioSmsMessage);
        }

        return null;
    }
}
