<?php

namespace GovWiki\RequestBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use GovWiki\DbBundle\Entity\Legislation;
use GovWiki\RequestBundle\Form\LegislationRequestType;
use Symfony\Component\Form\FormInterface;

/**
 * LegislationCreateRequest
 *
 * @ORM\Entity(
 *  repositoryClass="GovWiki\RequestBundle\Entity\Repository\LegislationCreateRequestRepository"
 * )
 */
class LegislationCreateRequest extends AbstractCreateRequest
{
    /**
     * @var Legislation
     *
     * @ORM\OneToOne(
     *  targetEntity="GovWiki\DbBundle\Entity\Legislation",
     *  mappedBy="request"
     * )
     */
    protected $subject;

    /**
     * @return FormInterface
     */
    public function getFormType()
    {
        return new LegislationRequestType();
    }

    /**
     * {@inheritdoc}
     */
    protected function currentEntityName()
    {
        return 'Legislation';
    }
}
