<?php

namespace GovWiki\AdminBundle\Services;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Routing\RouterInterface;

/**
 * Class TxtSitemapGenerator
 * @package GovWiki\AdminBundle\Services
 */
class TxtSitemapGenerator implements SitemapGeneratorInterface
{

    /**
     * @var EntityManagerInterface
     */
    private $em;

    /**
     * @var RouterInterface
     */
    private $router;

    /**
     * @var string
     */
    private $determinatorType;

    /**
     * @var string
     */
    private $webDir;

    /**
     * @param EntityManagerInterface $em               A EntityManagerInterface
     *                                                 instance.
     * @param RouterInterface        $router           A RouterInterface
     *                                                 instance.
     * @param string                 $determinatorType Determinator type.
     * @param string                 $webDir           Path to web directory.
     */
    public function __construct(
        EntityManagerInterface $em,
        RouterInterface $router,
        $determinatorType,
        $webDir
    ) {
        $this->em = $em;
        $this->router = $router;
        $this->determinatorType = $determinatorType;
        $this->webDir = $webDir;
    }

    /**
     * {@inheritdoc}
     */
    public function generate($environment)
    {
        $qb = $this->em->getRepository('GovWikiDbBundle:Government')
            ->createQueryBuilder('Government');
        $expr = $qb->expr();

        /*
         * Get current host name and URL generation type.
         */

        $host = '';
        $type = RouterInterface::ABSOLUTE_URL;

        if ('host' === $this->determinatorType) {
            $qb2 = $this->em->getRepository('GovWikiDbBundle:Environment')
                ->createQueryBuilder('Environment');
            $expr = $qb->expr();

            $domain = $qb2
                ->select('Environment.domain')
                ->where(
                    $expr->eq('Environment.slug', $expr->literal($environment))
                )
                ->getQuery()
                ->getSingleScalarResult();

            $host = 'http://'. $domain;
            $type = RouterInterface::ABSOLUTE_PATH;
        }

        /*
         * Get all governments and elected for given environment.
         */
        $governmentList = $qb
            ->select(
                'partial Government.{id, slug, altTypeSlug}',
                'partial ElectedOfficial.{id, slug}'
            )
            ->leftJoin('Government.electedOfficials', 'ElectedOfficial')
            ->join('Government.environment', 'Environment')
            ->where($expr->eq('Environment.slug', $expr->literal($environment)))
            ->getQuery()
            ->getArrayResult();

        /*
         * Get files names.
         */
        $robotsTxtName = self::getRobotsTxtName($environment);
        $sitemapName = self::getSitemapName($environment);

        /*
         * Iterate through governments and generate url.
         */
        $sitemap = [];
        foreach ($governmentList as $government) {
            $parameters = [
                'altTypeSlug' => $government['altTypeSlug'],
                'slug' => $government['slug'],
            ];
            if ('path' === $this->determinatorType) {
                $parameters['environment'] = $environment;
            }

            $sitemap[] = $host . $this->router->generate(
                'government',
                $parameters,
                $type
            ) . "\n";

            /*
             * Iterate through elected's and generate url.
             */
            foreach ($government['electedOfficials'] as $elected) {
                $parameters['electedSlug'] = $elected['slug'];
                $sitemap[] = $host . $this->router->generate(
                    'elected',
                    $parameters,
                    $type
                ) . "\n";
            }
        }

        file_put_contents($this->webDir .'/'. $sitemapName, $sitemap);
        file_put_contents($this->webDir .'/'. $robotsTxtName, [
            "User-agent: *\n",
            "Sitemap: {$host}/{$sitemapName}\n",
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public static function getRobotsTxtName($environment)
    {
        return "{$environment}_robots.txt";
    }

    /**
     * {@inheritdoc}
     */
    public static function getSitemapName($environment)
    {
        return "{$environment}_sitemap.txt";
    }
}
