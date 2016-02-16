<?php

namespace GovWiki\RequestBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use GovWiki\DbBundle\Entity\PublicStatement;
use GovWiki\DbBundle\Form\PublicStatementType;
use Symfony\Component\Form\FormInterface;

/**
 * PublicStatementCreateRequest
 *
 * @ORM\Entity(
 *  repositoryClass="GovWiki\RequestBundle\Entity\Repository\PublicStatementCreateRequestRepository"
 * )
 */
class PublicStatementCreateRequest extends AbstractCreateRequest
{
    /**
     * @var PublicStatement
     *
     * @ORM\OneToOne(
     *  targetEntity="GovWiki\DbBundle\Entity\PublicStatement",
     *  mappedBy="request"
     * )
     */
    protected $subject;

    /**
     * @return FormInterface
     */
    public function getFormType()
    {
        return new PublicStatementType();
    }

    /**
     * {@inheritdoc}
     */

    protected function currentEntityName()
    {
        return 'Public Statement';
    }
}
