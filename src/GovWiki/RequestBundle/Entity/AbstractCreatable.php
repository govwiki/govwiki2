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

    protected $request;

    /**
     * {@inheritdoc}
     */
    public function setRequest(AbstractCreateRequest $request)
    {
        $this->request = $request;
        $request->setSubject($this);

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
