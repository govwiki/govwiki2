<?php

namespace GovWiki\DbBundle\Importer;

use GovWiki\AdminBundle\Exception\FileTransformerException;
use GovWiki\AdminBundle\Transformer\FileTransformerInterface;
use GovWiki\DbBundle\Entity\Government;
use GovWiki\DbBundle\Entity\Repository\GovernmentRepository;
use GovWiki\DbBundle\Exception\InvalidFieldNameException;

/**
 * Class GovernmentImporter
 * @package GovWiki\DbBundle\Importer
 */
class GovernmentImporter extends AbstractImporter
{
    /**
     * Entity name supported by this importer.
     *
     * @return string
     */
    protected function getEntityName()
    {
        return 'GovWiki\DbBundle\Entity\Government';
    }

    /**
     * {@inheritdoc}
     */
    public function import(
        $filePath,
        FileTransformerInterface $transformer
    ) {
        $data = $transformer->transform($filePath);
        foreach ($data as $row) {
            $government = new Government();
            foreach ($row as $filed => $value) {
                $method = 'set'. ucfirst($filed);
                if (method_exists($government, $method)) {
                    call_user_func(
                        [
                            $government,
                            $method,
                        ],
                        [ $value ]
                    );
                } else {
                    throw new InvalidFieldNameException(
                        $filed,
                        $this->getEntityName()
                    );
                }
            }

            $this->persist($government);
        }
        $this->flush();
    }

    /**
     * {@inheritdoc}
     */
    public function export(
        $filePath,
        array $columns,
        FileTransformerInterface $transformer
    ) {
        /** @var GovernmentRepository $repository */
        $repository = $this->getRepository();
        $qb = $repository->createQueryBuilder('Government');

        if (count($columns) > 0) {
            $qb->select($this->prepareSelect($columns));
        }

        $data = $qb
            ->getQuery()
            ->getArrayResult();

        $transformer->reverseTransform($filePath, $data);
    }
}
