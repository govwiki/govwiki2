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
        return 'GovWiki\AdminBundle\Entity\Government';
    }

    /**
     * {@inheritdoc}
     */
    protected function import(
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
    protected function export(
        $filePath,
        array $columns,
        FileTransformerInterface $transformer
    ) {
        /** @var GovernmentRepository $repository */
        $repository = $this->getRepository();
        $data = $repository->createQueryBuilder('Government')
            ->select($this->prepareSelect($columns))
            ->getQuery()
            ->getArrayResult();

        $transformer->reverseTransform($filePath, $data);
    }
}
