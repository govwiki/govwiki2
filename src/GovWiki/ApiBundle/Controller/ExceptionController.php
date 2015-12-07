<?php

namespace GovWiki\ApiBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\FlattenException;
use Symfony\Component\HttpKernel\Log\DebugLoggerInterface;

/**
 * Return error in json format.
 *
 * @package GovWiki\ApiBundle\Controller
 */
class ExceptionController extends Controller
{
    /**
     * {@inheritdoc}
     */
    public function showExceptionAction(
        Request $request,
        FlattenException $exception,
        DebugLoggerInterface $logger = null
    ) {
        return new JsonResponse([
            'status'  => 'error',
            'message' => $exception->getMessage(),
        ]);
    }
}
