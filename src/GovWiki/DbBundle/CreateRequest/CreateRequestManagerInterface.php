<?php
namespace GovWiki\DbBundle\CreateRequest;

use GovWiki\DbBundle\Entity\Environment;
use GovWiki\RequestBundle\Entity\AbstractCreateRequest;
use GovWiki\RequestBundle\Entity\Interfaces\CreatableInterface;

/**
 * Interface CreateRequestManagerInterface
 * @package GovWiki\DbBundle\CreateRequest
 */
interface CreateRequestManagerInterface
{

    /**
     * @param array  $data        Create request, received from user.
     * @param string $environment A Environment instance.
     *
     * @return CreatableInterface
     *
     * @throws \Doctrine\ORM\Mapping\MappingException Can't get mapping of
     * 'request' field.
     * @throws \RuntimeException Wrong entity name.
     * @throws \Doctrine\ORM\ORMException Error while getting entity proxy.
     */
    public function process(array $data, $environment = null);
}
