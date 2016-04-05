<?php

namespace GovWiki\DbBundle\Doctrine\Functions;

use Doctrine\ORM\Query\AST\Functions\FunctionNode;
use Doctrine\ORM\Query as Query;

/**
 * Class Year
 * @package DoctrineExtensions\Query\Mysql
 */
class YearFunction extends FunctionNode
{
    public $date;

    /**
     * {@inheritdoc}
     */
    public function getSql(Query\SqlWalker $sqlWalker)
    {
        return 'YEAR(' . $sqlWalker->walkArithmeticPrimary($this->date) . ')';
    }

    /**
     * {@inheritdoc}
     */
    public function parse(Query\Parser $parser)
    {
        $parser->match(Query\Lexer::T_IDENTIFIER);
        $parser->match(Query\Lexer::T_OPEN_PARENTHESIS);
        $this->date = $parser->ArithmeticPrimary();
        $parser->match(Query\Lexer::T_CLOSE_PARENTHESIS);
    }
}