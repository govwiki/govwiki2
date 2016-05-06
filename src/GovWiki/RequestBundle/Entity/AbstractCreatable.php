<?php

namespace GovWiki\RequestBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use GovWiki\RequestBundle\Entity\Interfaces\CreatableInterface;

/**
 * AbstractCreatable
 *
 * @ORM\MappedSuperclass()
 */
abstract class AbstractCreatable implements CreatableInterface
{

    /**
     * @var AbstractCreateRequest
     */
    protected $request;

    /**
     * {@inheritdoc}
     */
    public function setRequest(AbstractCreateRequest $request = null)
    {
        $this->request = $request;
        if ($request !== null) {
            $request->setSubject($this);
        }

        return $this;
    }

    /**
     * {@inheritdoc}
     */
    public function getRequest()
    {
        return $this->request;
    }
}
