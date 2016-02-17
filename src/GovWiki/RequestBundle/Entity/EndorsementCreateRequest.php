<?php

namespace GovWiki\RequestBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use GovWiki\DbBundle\Entity\Endorsement;
use GovWiki\DbBundle\Form\EndorsementType;
use Symfony\Component\Form\FormInterface;

/**
 * EndorsementCreateRequest
 *
 * @ORM\Entity(
 *  repositoryClass="GovWiki\RequestBundle\Entity\Repository\EndorsementCreateRequestRepository"
 * )
 */
class EndorsementCreateRequest extends AbstractCreateRequest
{
    /**
     * @var Endorsement
     *
     * @ORM\OneToOne(
     *  targetEntity="GovWiki\DbBundle\Entity\Endorsement",
     *  mappedBy="request"
     * )
     */
    protected $subject;

    /**
     * @return FormInterface
     */
    public function getFormType()
    {
        return new EndorsementType();
    }

    /**
     * {@inheritdoc}
     */

    protected function currentEntityName()
    {
        return 'Endorsement';
    }
}
