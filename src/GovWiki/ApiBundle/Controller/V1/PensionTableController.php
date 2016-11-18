<?php

namespace GovWiki\ApiBundle\Controller\V1;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Query\QueryBuilder;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;

/**
 * PensionTableController
 * Need to show data on client wordpress site.
 * Used only for california environment.
 *
 * @Route("pension-table")
 */
class PensionTableController extends AbstractGovWikiApiController
{

    private $operations = [
        'string' => [
            'eq' => '=',
            'neq' => '<>',
            'contains' => 'LIKE',
        ],
        'number' => [
            'lt' => '<',
            'lte' => '<=',
            'eq' => '=',
            'neq' => '<>',
            'gte' => '>=',
            'gt' => '>',
            'between' => 'BETWEEN',
        ],
        'currency' => [
            'lt' => '<',
            'lte' => '<=',
            'eq' => '=',
            'neq' => '<>',
            'gte' => '>=',
            'gt' => '>',
            'between' => 'BETWEEN',
        ],
    ];

    private $fieldsConfig = [
        'employee_name' => 'string',
        'job_title' => 'string',
        'employer' => 'string',
        'pension_system' => 'string',
        'region' => 'string',
        'pension_amount' => 'currency',
        'benefits_amount' => 'currency',
        'disability_amount' => 'currency',
        'total_amount' => 'currency',
        'notes' => 'string',
        'total_net_of_one_time_payments' => 'currency',
        'years_of_service' => 'number',
        'year_of_retirement' => 'number',
        'year' => 'number',
    ];

    /**
     * Get pensions data.
     * Available query parameters:
     *  - filterField
     *  - filterOperation
     *      for strings:
     *          - eq (equal)
     *          - neq (not equal)
     *          - contains
     *      for numbers:
     *          - lt (less then)
     *          - lte (less or equal)
     *          - eq (equal)
     *          - neq (equal)
     *          - gte (great or equal)
     *          - gt (great then)
     *  - filterValue
     *  - sortFiled
     *  - sortOrder
     *  - limit
     *  - offset
     *
     * Return array of california pensions data:
     * {
     *  "status": "success",
     *  "data": [
     *   { ... },
     *   { ... },
     *   ...
     *  ]
     * }
     *
     * @Route("/")
     *
     * @param Request $request A Request instance.
     *
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function indexAction(Request $request)
    {
        $limit = $this->getLimit($request);
        $offset = $this->getOffset($request);

        /** @var Connection $em */
        $em = $this->getDoctrine()->getConnection();

        // Prepare columns.
        $selectStmt = [];
        foreach ($this->fieldsConfig as $name => $type) {
            if ($type === 'currency') {
                $selectStmt[] = "FORMAT({$name}, 2) AS {$name}_formatted";
            } else {
                $selectStmt[] = $name;
            }
        }

        $qb = $em->createQueryBuilder();
        $qb
            ->select(implode(',', $selectStmt))
            ->from('tc_pensions');

        if (($error = $this->applyFilter($request, $qb)) !== '') {
            return $this->badRequestResponse($error);
        }

        if (($error = $this->applySort($request, $qb)) !== '') {
            return $this->badRequestResponse($error);
        }

        $countQb = clone $qb;
        $countQb->select('COUNT(*)');
        $qb
            ->setMaxResults($limit)
            ->setFirstResult($offset);

        return $this->successResponse([
            'rows' => $qb->execute()->fetchAll(\PDO::FETCH_ASSOC),
            'totalCount' => $countQb->execute()->fetchColumn(),
        ]);
    }

    /**
     * @param Request      $request A Request instance.
     * @param QueryBuilder $qb      A QueryBuilder instance.
     *
     * @return string Empty string if all ok, otherwise occurred error description.
     */
    private function applyFilter(Request $request, QueryBuilder $qb)
    {
        $filterField = trim($request->query->get('filterField'));
        $filterOperation = trim($request->query->get('filterOperation'));
        $filterValue = $request->query->get('filterValue');

        if ($filterField && $filterOperation) {
            // Check filter field.
            if (! in_array($filterField, array_keys($this->fieldsConfig))) {
                // Invalid field name.
                return 'Invalid field name for filtering, expect one of '
                    . implode(', ', array_keys($this->fieldsConfig))
                    . ", but '{$filterField}' given";
            }

            // Get current field type and available operations.
            $type = $this->fieldsConfig[$filterField];
            $operations = $this->operations[$type];

            // Check filter operation.
            if (! in_array($filterOperation, array_keys($operations))) {
                // Invalid field name.
                return 'Invalid operation for filtering, expect one of '
                . implode(', ', array_keys($operations))
                . ", but '{$filterOperation}' given";
            }


            $condition = $filterField;

            if (strtolower(trim($filterValue)) === '') {
                $condition .= ' IS NULL';
            } else {
                $dbOperation = $operations[$filterOperation];
                $condition .= ' '. $dbOperation;

                if ($type === 'string') {
                    $condition = $this->processStringFilter(
                        $filterValue,
                        $filterOperation,
                        $condition,
                        $qb
                    );
                } else {
                    $condition = $this->processNumberFilter(
                        $filterValue,
                        $filterOperation,
                        $condition,
                        $qb
                    );
                }
            }

            $qb->andWhere($condition);
        }

        return '';
    }

    /**
     * @param string       $filterValue     Filter value.
     * @param string       $filterOperation Filter operation.
     * @param string       $condition       Filter condition.
     * @param QueryBuilder $qb              A QueryBuilder instance.
     *
     * @return string
     */
    private function processStringFilter(
        $filterValue,
        $filterOperation,
        $condition,
        QueryBuilder $qb
    ) {
        $filterValue = strtolower(trim($filterValue));

        if ($filterValue === 'null') {
            $condition .= ' IS NULL';
        } else {
            $condition .= ' :filter';
            if ($filterOperation === 'contains') {
                $filterValue = "%{$filterValue}%";
            }
            $qb->setParameter('filter', $filterValue);
        }

        return $condition;
    }

    /**
     * @param string       $filterValue     Filter value.
     * @param string       $filterOperation Filter operation.
     * @param string       $condition       Filter condition.
     * @param QueryBuilder $qb              A QueryBuilder instance.
     *
     * @return string
     */
    private function processNumberFilter(
        $filterValue,
        $filterOperation,
        $condition,
        QueryBuilder $qb
    ) {
        if ($filterOperation === 'between') {
            // For between operation assume that filer value contains two values
            // delimited by comma.
            $values = explode(',', $filterValue);
            $min = filter_var($values[0], FILTER_VALIDATE_INT);
            $max = filter_var($values[1], FILTER_VALIDATE_INT);

            $condition .= ' :min AND :max';
            $qb->setParameter('min', $min);
            $qb->setParameter('max', $max);
        } else {
            $filterValue = filter_var($filterValue, FILTER_VALIDATE_INT);
            $qb->setParameter('filter', $filterValue);
            $condition .= ' :filter';
        }

        return $condition;
    }

    /**
     * @param Request      $request A Request instance.
     * @param QueryBuilder $qb      A QueryBuilder instance.
     *
     * @return string Empty string if all ok, otherwise occurred error description.
     */
    private function applySort(Request $request, QueryBuilder $qb)
    {
        $sortField = trim($request->query->get('sortField'));
        $sortOrder = strtolower(trim($request->query->get('sortOrder')));

        if ($sortField && $sortOrder) {
            // Check sort field and order.
            if (! in_array($sortField, array_keys($this->fieldsConfig))) {
                // Invalid field name.
                return 'Invalid field name for sorting, expect one of '
                    . implode(', ', array_keys($this->fieldsConfig))
                    . ", but '{$sortField}' given";
            }

            if (! in_array($sortOrder, [ 'asc', 'desc' ])) {
                // Invalid order.
                return 'Invalid sorting order, expect one of asc, desc, but '
                    . "{$sortOrder} given";
            }

            // Add sort condition.
            $qb->orderBy($sortField, $sortOrder);
        }

        return '';
    }

    /**
     * @param Request $request A Request instance.
     *
     * @return integer
     */
    private function getLimit(Request $request)
    {
        return filter_var($request->query->get('limit'), FILTER_VALIDATE_INT) ?: 25;
    }

    /**
     * @param Request $request A Request instance.
     *
     * @return integer
     */
    private function getOffset(Request $request)
    {
        return filter_var($request->query->get('offset'), FILTER_VALIDATE_INT) ?: 0;
    }
}
