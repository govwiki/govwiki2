<?php

namespace GovWiki\ApiBundle\Controller;

use GuzzleHttp\Client;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\DomCrawler\Crawler;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class UrlController
 * @package GovWiki\ApiBundle\Controller
 */
class UrlController extends Controller
{
    /**
     * Extract url content, like facebook does it.
     *
     * @Route(path="/extract/", methods={"GET"})
     *
     * @param Request $request A Request instance.
     *
     * @return JsonResponse
     */
    public function extractAction(Request $request)
    {
        $url = urldecode($request->query->get('url'));

        /*
         * Get url content.
         */
        $client  = new Client();
        try {
            $response = $client->get($url);
        } catch (\Exception $e) {
            return new Response('Can not evaluate link', 400);
        }

        $contentType = $response->getHeader('content-type')[0];

        $type = '';
        $data = [];

        if (strstr($contentType, 'html')) {
            /*
             * Html
             */
            $crawler = new Crawler($response->getBody()->getContents(), $url);
            $body = $crawler->filter('body')->text();
            $body = preg_replace('/\s+/', ' ', $body);

            $data['title'] = $crawler->filter('title')->text();

            if (preg_match('/www\.youtube/', $url)) {
                $videoId = preg_replace('/.*\?v=([^&]+).*/', '$1', $url);
                $type = 'youtube';
                $data['preview'] = "http://img.youtube.com/vi/$videoId/default.jpg";
            } else {
                $type = 'html';
                $data = [
                    'title'   => $crawler->filter('title')->text(),
                    'body'    => trim(substr($body, 0, strpos($body, ' ', 200))),
                ];
            }
        } elseif (strstr($contentType, 'image')) {
            /*
             * Image.
             */
            $type = 'image';
        }

        return new JsonResponse([
            'type' => $type,
            'data' => $data,
        ]);
    }
}
