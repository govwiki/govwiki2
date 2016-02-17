<?php

namespace GovWiki\RequestBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use GovWiki\DbBundle\Entity\Contribution;
use GovWiki\DbBundle\Form\ContributionType;
use Symfony\Component\Form\FormInterface;

/**
 * ContributionCreateRequest
 *
 * @ORM\Entity(
 *  repositoryClass="GovWiki\RequestBundle\Entity\Repository\ContributionCreateRequestRepository"
 * )
 */
class ContributionCreateRequest extends AbstractCreateRequest
{
    /**
     * @var Contribution
     *
     * @ORM\OneToOne(
     *  targetEntity="GovWiki\DbBundle\Entity\Contribution",
     *  mappedBy="request"
     * )
     */
    protected $subject;

    /**
     * @return FormInterface
     */
    public function getFormType()
    {
        return new ContributionType();
    }

    /**
     * {@inheritdoc}
     */
    protected function currentEntityName()
    {
        return 'Contribution';
    }
}
