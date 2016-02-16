<?php
namespace GovWiki\DbBundle\CreateRequest;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Mapping\MappingException;
use GovWiki\DbBundle\Entity\AbstractCreatable;

/**
 * Interface CreateRequestManagerInterface
 * @package GovWiki\DbBundle\CreateRequest
 */
interface CreateRequestManagerInterface
{

    /**
     * @param array $data Create request, received from user.
     *
     * @return AbstractCreatable
     */
    public function process(array $data);
}
