<?php

namespace GovWiki\FileLibraryBundle\Entity;

use Cocur\Slugify\Slugify;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\FileLibraryBundle\Repository\FileRepository;

/**
 * Class EntityFactory
 *
 * @package GovWiki\FileLibraryBundle\Entity
 */
class EntityFactory
{

    const STATE_MAP = [
        'AL' => 'Alabama',
        'AK' => 'Alaska',
        'AS' => 'American Samoa',
        'AZ' => 'Arizona',
        'AR' => 'Arkansas',
        'CA' => 'California',
        'CO' => 'Colorado',
        'CT' => 'Connecticut',
        'DE' => 'Delaware',
        'DC' => 'District of Columbia',
        'FM' => 'Federated States of Micronesia',
        'FL' => 'Florida',
        'GA' => 'Georgia',
        'GU' => 'Guam',
        'HI' => 'Hawaii',
        'ID' => 'Idaho',
        'IL' => 'Illinois',
        'IN' => 'Indiana',
        'IA' => 'Iowa',
        'KS' => 'Kansas',
        'KY' => 'Kentucky',
        'LA' => 'Louisiana',
        'ME' => 'Maine',
        'MD' => 'Maryland',
        'MA' => 'Massachusetts',
        'MI' => 'Michigan',
        'MN' => 'Minnesota',
        'MS' => 'Mississippi',
        'MO' => 'Missouri',
        'MT' => 'Montana',
        'NE' => 'Nebraska',
        'NV' => 'Nevada',
        'NH' => 'New Hampshire',
        'NJ' => 'New Jersey',
        'NM' => 'New Mexico',
        'NY' => 'New York',
        'NC' => 'North Carolina',
        'ND' => 'North Dakota',
        'MP' => 'Northern Mariana Islands',
        'OH' => 'Ohio',
        'OK' => 'Oklahoma',
        'OR' => 'Oregon',
        'PA' => 'Pennsylvania',
        'PR' => 'Puerto Rico',
        'RI' => 'Rhode Island',
        'SC' => 'South Carolina',
        'SD' => 'South Dakota',
        'TN' => 'Tennessee',
        'TX' => 'Texas',
        'UT' => 'Utah',
        'VT' => 'Vermont',
        'VI' => 'Virgin Islands',
        'VA' => 'Virginia',
        'WA' => 'Washington',
        'WV' => 'West Virginia',
        'WI' => 'Wisconsin',
        'WY' => 'Wyoming',
    ];

    /**
     * @var Slugify
     */
    private $slugify;

    /**
     * @var FileRepository
     */
    private $fileRepository;

    /**
     * EntityFactory constructor.
     *
     * @param FileRepository $fileRepository A FileRepository instance.
     */
    public function __construct(FileRepository $fileRepository)
    {
        $this->slugify = new Slugify();
        $this->fileRepository = $fileRepository;
    }

    /**
     * @param Environment $environment Required environment.
     * @param string      $name        Full document name.
     * @param integer     $fileSize    File size in bytes.
     * @param Directory   $parent      A parent directory.
     *
     * @return Document
     */
    public function createDocument(
        Environment $environment,
        string $name,
        int $fileSize,
        Directory $parent
    ): Document {
        $publicPath = $this->generatePublicPath($name, $parent);

        $nameWithoutExt = $name;
        $ext = '';

        $pos = strrpos($name, '.');
        if ($pos !== false) {
            $nameWithoutExt = substr($name, 0, $pos);
            $ext = substr($name, $pos + 1);
        }

        return new Document(
            $environment,
            $nameWithoutExt,
            $ext,
            $publicPath,
            $this->slugify->slugify($publicPath),
            $fileSize,
            $parent
        );
    }

    /**
     * @param Environment    $environment Required environment.
     * @param string         $name        A directory name.
     * @param Directory|null $parent      A parent directory.
     *
     * @return Directory
     */
    public function createDirectory(
        Environment $environment,
        string $name,
        Directory $parent = null
    ): Directory {
        $publicPath = $this->generatePublicPath($name, $parent);

        if (isset(self::STATE_MAP[$name])) {
            $name = self::STATE_MAP[$name];
        }

        return new Directory(
            $environment,
            $name,
            $publicPath,
            $this->slugify->slugify($publicPath),
            $parent
        );
    }

    /**
     * Create directory by path.
     *
     * Examples:
     *
     * ```php
     * $factory->createDirectoryByPath($env, [ 'directory', 'subdirectory' ]);
     * $factory->createDirectoryByPath($env, [ 'another-directory' ]);
     * ```
     *
     * @param Environment $environment Required environment.
     * @param string[]    $path        Path to created directory splitted into array.
     *
     * @return Directory
     * @psalm-suppress UnusedVariable
     */
    public function createDirectoryByPath(Environment $environment, array $path): Directory
    {
        list($idx, $parent) = $this->findClosestExistsParent($environment, $path);
        $count = \count($path);
        $directory = $parent;

        for ($i = $idx; $i < $count; ++$i) {
            if (($parent !== null) && (! $parent instanceof Directory)) {
                throw new \DomainException('Document and directories maybe added only in directory');
            }

            $directory = $this->createDirectory($environment, $path[$i], $parent);
            $parent = $directory;
        }

        /** @var Directory $directory */
        return $directory;
    }

    /**
     * @param string    $name   A filename.
     * @param Directory $parent A parent directory.
     *
     * @return string
     */
    private function generatePublicPath(string $name, Directory $parent = null): string
    {
        $parentPublicPath = '';
        if ($parent !== null) {
            $parentPublicPath = $parent->getPublicPath();
        }

        return $parentPublicPath  .'/'. $name;
    }

    /**
     * @param Environment $environment Required environment.
     * @param string[]    $path        Path to created directory splitted into array.
     *
     * @return array{0: int, 1: AbstractFile|null}
     */
    private function findClosestExistsParent(Environment $environment, array $path): array
    {
        /** @var AbstractFile|null $parent */
        $parent = null;
        $idx = 0;
        $checkPath = '';

        foreach ($path as $dirName) {
            $checkPath .= '/'. $dirName;
            $dir = $this->fileRepository->findByPublicPath($environment->getName(), $checkPath);

            if ($dir === null) {
                break;
            }
            $parent = $dir;
            $idx++;
        }

        return [ $idx, $parent ];
    }
}
