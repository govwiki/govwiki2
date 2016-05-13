<?php

namespace GovWiki\AdminBundle\Request\ParamConverter;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityNotFoundException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Request\ParamConverter\ParamConverterInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class EnvironmentParamConverter
 * @package GovWiki\AdminBundle\Request\ParamConverter
 */
class EnvironmentParamConverter implements ParamConverterInterface
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
    public function supports(ParamConverter $configuration)
    {
        return strstr($configuration->getClass(), 'Environment') !== false;
    }

    /**
     * {@inheritdoc}
     */
    public function apply(Request $request, ParamConverter $configuration)
    {
        $slug = $request->attributes->get($configuration->getName(), null);
        if (null === $slug) {
            throw new \InvalidArgumentException("Can't find entity id attribute {$configuration->getName()}");
        }

        $environment = $this->em->getRepository('GovWikiDbBundle:Environment')
            ->findOneBy([ 'slug' => $slug ]);

        if (null === $environment) {
            throw new EntityNotFoundException();
        }

        $request->attributes->set($configuration->getName(), $environment);
    }
}
