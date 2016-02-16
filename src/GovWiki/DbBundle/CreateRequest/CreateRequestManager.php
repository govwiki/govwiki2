<?php
namespace GovWiki\DbBundle\CreateRequest;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Mapping\MappingException;
use GovWiki\DbBundle\Entity\AbstractCreatable;

/**
 * Class CreateRequestManager
 * @package GovWiki\DbBundle\CreateRequest
 */
class CreateRequestManager implements CreateRequestManagerInterface
{

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @param EntityManagerInterface $em A EntityManagerInterface instance.
     */
    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    /**
     * {@inheritdoc}
     */
    public function process(array $data)
    {
        /*
         * Get all parameters from array.
         */
        $entityName = $data['entityName'];

        $user = null;
        if (array_key_exists('user', $data)) {
            $user = (int) $data['user'];
        }
        $data = $data['fields'];

        $metadata = $this->getClassMetadata($entityName);
        $entityClass = $metadata->getName();

        $entity = new $entityClass();

        /*
         * Set fields.
         */
        foreach ($data['fields'] as $fieldName => $value) {
            $fieldMapping = $metadata->getFieldMapping($fieldName);
            if (strpos($fieldMapping['type'], 'date') !== false) {
                $value = new \DateTime($value);
            }
            $this->callSetter($entity, $fieldName, $value);
        }

        /*
         * Set associated entities.
         */
        foreach ($data['associations'] as $entityName => $id) {
            $proxy = $this->getReference($entityName, $id);
            $this->callSetter($entity, $entityName, $proxy);
        }

        /*
         * Create and add childs entity.
         */
        if (array_key_exists('childs', $data)) {
            foreach ($data['childs'] as $child) {
                $childEntity = $this->process($child);
                $this->callSetter(
                    $entity,
                    $child['entityName'],
                    $childEntity,
                    true
                );
            }
        }

        if ($entity instanceof AbstractCreatable) {
            $user = $this->em
                ->getReference('GovWiki\UserBundle\Entity\User', $user);
            $entity
                ->setState(AbstractCreatable::STATE_PENDING)
                ->setCreator($user);
        }

        return $entity;
    }

    /**
     * @param string $entityName Entity name.
     *
     * @return \Doctrine\ORM\Mapping\ClassMetadataInfo
     *
     * @throws \RuntimeException Wrong entity name.
     */
    private function getClassMetadata($entityName)
    {
        $entityName = ucfirst($entityName);

        if (('' === $entityName) || (null === $entityName)) {
            throw new \RuntimeException('Entity name empty');
        }

        try {
            return $this->em
                ->getClassMetadata("GovWikiDbBundle:{$entityName}");
        } catch (MappingException $e) {
            throw new \RuntimeException(
                "Can't find entity with name '{$entityName}', due to bad entry or internal system error"
            );
        }
    }

    /**
     * @param string  $entityName Entity name, not class.
     * @param integer $id         Entity id.
     *
     * @return object
     *
     * @throws \RuntimeException Wrong entity name.
     * @throws \Doctrine\ORM\ORMException Error while getting entity proxy.
     */
    private function getReference($entityName, $id)
    {
        $metadata = $this->getClassMetadata($entityName);

        return $this->em->getReference($metadata->getName(), $id);
    }

    /**
     * @param object  $entity     Entity object.
     * @param string  $fieldName  Entity field name.
     * @param mixed   $argument   Entity setter argument.
     * @param boolean $collection Flag, if set try to use add* method.
     *
     * @return string
     */
    private function callSetter(
        $entity,
        $fieldName,
        $argument,
        $collection = false
    ) {
        $fieldName = ucfirst($fieldName);

        $prefix = 'set';
        if ($collection) {
            $prefix = 'add';
        }

        call_user_func([ $entity, "{$prefix}{$fieldName}" ], $argument);
    }
}
