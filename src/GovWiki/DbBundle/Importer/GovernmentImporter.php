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
     * {@inheritdoc}
     */
    public function import(
        $filePath,
        FileTransformerInterface $transformer
    ) {
        $data = $transformer->transform($filePath);
        foreach ($data as $row) {
            /** @var Government $government */
            $government = $this->manager->create();

            foreach ($row as $filed => $value) {
                $method = 'set'. ucfirst($filed);
                if (method_exists($government, $method)) {
                    call_user_func(
                        [
                            $government,
                            $method,
                        ],
                        $value
                    );
                } else {
                    throw new InvalidFieldNameException(
                        $filed,
                        'government'
                    );
                }
            }

            $this->manager->update($government, false);
        }
        $this->manager->flush();
    }

    /**
     * {@inheritdoc}
     */
    public function export(
        $filePath,
        array $columns,
        FileTransformerInterface $transformer
    ) {
        $data = $this->manager->getAll($columns);
        $transformer->reverseTransform($filePath, $data);
    }
}
