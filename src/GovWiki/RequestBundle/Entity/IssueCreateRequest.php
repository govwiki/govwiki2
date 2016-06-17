<?php

namespace GovWiki\RequestBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use GovWiki\DbBundle\Entity\Legislation;
use GovWiki\DbBundle\Form\DocumentType;
use GovWiki\RequestBundle\Form\LegislationRequestType;
use Symfony\Component\Form\FormInterface;

/**
 * IssueCreateRequest
 *
 * @ORM\Entity(
 *  repositoryClass="GovWiki\RequestBundle\Entity\Repository\IssueCreateRequestRepository"
 * )
 */
class IssueCreateRequest extends AbstractCreateRequest
{
    /**
     * @var Legislation
     *
     * @ORM\OneToOne(
     *  targetEntity="GovWiki\DbBundle\Entity\Issue",
     *  mappedBy="request"
     * )
     */
    protected $subject;

    /**
     * @return FormInterface
     */
    public function getFormType()
    {
        return 'document';
    }

    /**
     * {@inheritdoc}
     */
    protected function currentEntityName()
    {
        return 'Issue';
    }
}
