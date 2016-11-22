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
     *  - filterColumn
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
     *  - sortColumn
     *  - sortOrder
     *  - limit
     *  - offset
     *  - showedColumns
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
        $showedColumns = $this->getShowedColumns($request);

        $filteredFieldConfig = [];

        // Intersect requested columns and available.
        foreach ($showedColumns as $column) {
            if (! isset($this->fieldsConfig[$column])) {
                return $this->badRequestResponse('Unknown column '. $column);
            }

            $filteredFieldConfig[$column] = $this->fieldsConfig[$column];
        }

        /** @var Connection $em */
        $em = $this->getDoctrine()->getConnection();

        // Prepare columns.
        $selectStmt = [];

        // Get only those fields which specified in request;

        foreach ($filteredFieldConfig as $name => $type) {
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
        $column = trim($request->query->get('filterColumn'));
        $operation = trim($request->query->get('filterOperation'));
        $value = $request->query->get('filterValue');

        if ($column && $operation) {
            // Check filter field.
            if (! in_array($column, array_keys($this->fieldsConfig))) {
                // Invalid field name.
                return 'Invalid field name for filtering, expect one of '
                    . implode(', ', array_keys($this->fieldsConfig))
                    . ", but '{$column}' given";
            }

            // Get current field type and available operations.
            $type = $this->fieldsConfig[$column];
            $operations = $this->operations[$type];

            // Check filter operation.
            if (! in_array($operation, array_keys($operations))) {
                // Invalid field name.
                return 'Invalid operation for filtering, expect one of '
                . implode(', ', array_keys($operations))
                . ", but '{$operation}' given";
            }


            $condition = $column;

            if (strtolower(trim($value)) === '') {
                $condition .= ' IS NULL';
            } else {
                $dbOperation = $operations[$operation];
                $condition .= ' '. $dbOperation;

                if ($type === 'string') {
                    $condition = $this->processStringFilter(
                        $value,
                        $operation,
                        $condition,
                        $qb
                    );
                } else {
                    $condition = $this->processNumberFilter(
                        $value,
                        $operation,
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
        $column = trim($request->query->get('sortColumn'));
        $order = strtolower(trim($request->query->get('sortOrder')));

        if ($column && $order) {
            // Check sort field and order.
            if (! in_array($column, array_keys($this->fieldsConfig))) {
                // Invalid field name.
                return 'Invalid field name for sorting, expect one of '
                    . implode(', ', array_keys($this->fieldsConfig))
                    . ", but '{$column}' given";
            }

            if (! in_array($order, [ 'asc', 'desc' ])) {
                // Invalid order.
                return 'Invalid sorting order, expect one of asc, desc, but '
                    . "{$order} given";
            }

            // Add sort condition.
            $qb->orderBy($column, $order);
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

    /**
     * @param Request $request A Request instance.
     *
     * @return string[]
     */
    private function getShowedColumns(Request $request)
    {
        $columns = $request->query->get('showedColumns');
        return array_filter(array_map('trim', explode(',', $columns)));
    }
}
