<?php

namespace GovWiki\EnvironmentBundle\Twig;

use Doctrine\ORM\EntityManagerInterface;
use GovWiki\DbBundle\Entity\Environment;
use GovWiki\EnvironmentBundle\Manager\ElectedOfficial\ElectedOfficialManagerInterface;
use GovWiki\EnvironmentBundle\Storage\EnvironmentStorageInterface;
use GovWiki\EnvironmentBundle\Strategy\GovwikiNamingStrategy;
use Symfony\Component\Translation\TranslatorInterface;
use Symfony\Component\Translation\MessageCatalogue;

/**
 * Class Extension
 * @package GovWiki\EnvironmentBundle\Twig
 */
class Extension extends \Twig_Extension
{

    /**
     * @var EnvironmentStorageInterface
     */
    private $storage;

    /**
     * @var ElectedOfficialManagerInterface
     */
    private $electedOfficialManager;

    /**
     * @var TranslatorInterface
     */
    private $translator;

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @param EnvironmentStorageInterface     $storage                A
     *                                                                EnvironmentStorageInterface
     *                                                                instance.
     * @param ElectedOfficialManagerInterface $electedOfficialManager A
     *                                                                ElectedOfficialManagerInterface
     *                                                                instance.
     * @param TranslatorInterface             $translator             A
     *                                                                TranslatorInterface
     *                                                                instance.
     * @param EntityManagerInterface          $em                     A
     *                                                                EntityManagerInterface
     *                                                                instance.
     */
    public function __construct(
        EnvironmentStorageInterface $storage,
        ElectedOfficialManagerInterface $electedOfficialManager,
        TranslatorInterface $translator,
        EntityManagerInterface $em
    ) {
        $this->storage = $storage;
        $this->electedOfficialManager = $electedOfficialManager;
        $this->translator = $translator;
        $this->em = $em;
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'govwiki_environment';
    }

    /**
     * {@inheritdoc}
     */
    public function getGlobals()
    {
        $environment = $this->storage->get();

        /** @var MessageCatalogue $catalogue */
        $transKey = 'general.bottom_text';
        $bottomText = $this->translator->trans($transKey);
        if ($transKey === $bottomText) {
            $bottomText = '';
        }

        if ($environment) {
            return [
                'environment'         => $environment,
                'bottomText'          => $bottomText,
                'hasElectedOfficials' => $this->electedOfficialManager
                        ->computeElectedOfficialsCount($environment) > 0,
            ];
        }

        return [];
    }

    /**
     * {@inheritdoc}
     */
    public function getFilters()
    {
        return [
            new \Twig_SimpleFilter('cartoDbDataset', [
                $this,
                'getCartoDbDataset',
            ]),

            new \Twig_SimpleFilter('regexpReplace', [
                $this,
                'regexpReplace',
            ]),

            new \Twig_SimpleFilter('rankName', [
                $this,
                'rankName',
            ])
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('issuesCategoriesSource', [
                $this,
                'getIssuesCategoriesSource',
            ]),
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function getTests()
    {
        return [
            new \Twig_SimpleTest('instanceof', [
                $this,
                'isInstanceOf',
            ]),
        ];
    }

    /**
     * @param Environment $environment A Environment entity instance.
     *
     * @return string
     */
    public function getCartoDbDataset(Environment $environment)
    {
        return GovwikiNamingStrategy::cartoDbDatasetName($environment);
    }

    /**
     * @param mixed $subject     The string or an array with strings to search
     *                           and replace.
     * @param mixed $pattern     The pattern to search for. It can be either a
     *                           string or an array with strings.
     * @param mixed $replacement The string or an array with strings to replace.
     *
     * @return string
     */
    public function regexpReplace($subject, $pattern, $replacement)
    {
        return preg_replace($pattern, $replacement, $subject);
    }

    /**
     * @param mixed  $subject  Some object to test.
     * @param string $instance Class name.
     *
     * @return boolean
     */
    public function isInstanceOf($subject, $instance)
    {
        return $subject instanceof $instance;
    }

    /**
     * @return string
     */
    public function getIssuesCategoriesSource()
    {
        $categories = $this->em->getRepository('GovWikiDbBundle:IssueCategory')
            ->findAll();

        $source = [];
        /** @var \GovWiki\DbBundle\Entity\IssueCategory $category */
        foreach ($categories as $category) {
            $source[$category->getId()] = $category->getName();
        }

        return $source;
    }

    /**
     * @param string $name Original field name.
     *
     * @return string
     */
    public function rankName($name)
    {
        return GovwikiNamingStrategy::rankedFieldName($name);
    }
}
