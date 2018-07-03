<?php

namespace GovWiki\AdminBundle\Entity\Repository;

use Doctrine\ORM\EntityRepository;
use GovWiki\AdminBundle\Entity\Script;
use GovWiki\AdminBundle\Entity\ScriptParameter;

/**
 * Class ScriptParameterRepository
 *
 * @package GovWiki\AdminBundle\Entity\Repository
 */
class ScriptParameterRepository extends EntityRepository
{

    /**
     * @param string $name Required script name.
     *
     * @return ScriptParameter[] Indexed by parameter key.
     */
    public function getForScript(string $name): array
    {
        $subDql = $this->_em->createQueryBuilder()
            ->select('Script.paramCategories')
            ->from(Script::class, 'Script')
            ->where('Script.name = :name')
            ->groupBy('Script.paramCategories')
            ->getDQL();

        /** @var ScriptParameter[] $data */
        $data = $this->createQueryBuilder('ScriptParameter')
            ->where('ScriptParameter.category IN ('. $subDql .')')
            ->setParameter('name', $name)
            ->getQuery()
            ->getResult();

        $indexed = [];
        foreach ($data as $datum) {
            $indexed[$datum->getKey()] = $datum;
        }

        return $indexed;
    }
}
