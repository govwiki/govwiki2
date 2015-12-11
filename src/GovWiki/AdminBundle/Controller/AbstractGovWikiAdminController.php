<?php

namespace GovWiki\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class AbstractGovWikiAdminController extends Controller
{
    /**
     * @param $data
     * @param $page
     * @param $limit
     *
     * @return \Knp\Component\Pager\Pagination\PaginationInterface
     */
    protected function paginate($data, $page, $limit)
    {
        return $this->get('knp_paginator')->paginate(
            $data,
            $page,
            $limit
        );
    }
}