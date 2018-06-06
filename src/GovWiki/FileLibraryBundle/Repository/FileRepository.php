<?php

namespace GovWiki\FileLibraryBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Expr\Join;
use Doctrine\ORM\QueryBuilder;
use GovWiki\FileLibraryBundle\Entity\AbstractFile;
use GovWiki\FileLibraryBundle\Entity\Directory;

/**
 * Interface FileRepository
 *
 * @package GovWiki\FileLibraryBundle\Entity\Repository
 */
class FileRepository extends EntityRepository
{

    /**
     * Find file by slug.
     *
     * @param string $environment Required environment name.
     * @param string $id          File id.
     *
     * @return AbstractFile|null
     */
    public function findById(string $environment, string $id)
    {
        return $this->createBuilder($environment)
            ->where('File.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Find file by slug.
     *
     * @param string $environment Required environment name.
     * @param string $slug        File slug.
     *
     * @return AbstractFile|null
     */
    public function findBySlug(string $environment, string $slug)
    {
        return $this->createBuilder($environment)
            ->where('File.slug = :slug')
            ->setParameter('slug', $slug)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * @param string $environment Required environment name.
     *
     * @return string[]
     */
    public function getTopLevelDirNames(string $environment): array
    {
        $results = $this->createBuilder($environment)
            ->select('File.id, File.name')
            ->where('File.parent IS NULL AND File INSTANCE OF '. Directory::class)
            ->getQuery()
            ->getArrayResult();

        $names = [];

        foreach ($results as $result) {
            $names[(int) $result['id']] = $result['name'];
        }

        return $names;
    }

    /**
     * @param string $environment Required environment name.
     * @param string $publicPath  A public path to file.
     *
     * @return AbstractFile|null
     */
    public function findByPublicPath(string $environment, string $publicPath)
    {
        return $this->createBuilder($environment)
            ->where('File.publicPath = :publicPath')
            ->setParameter('publicPath', $publicPath)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * @param string $environment A required environment name.
     *
     * @return QueryBuilder
     */
    private function createBuilder(string $environment): QueryBuilder
    {
        return $this->createQueryBuilder('File')
            ->innerJoin('File.environment', 'Environment', Join::WITH, 'Environment.name = :environment')
            ->where('File.id = :id')
            ->setParameter('environment', $environment);
    }
}
