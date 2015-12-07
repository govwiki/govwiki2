<?php

namespace GovWiki\DbBundle\Doctrine\Functions;

use Doctrine\ORM\Query\AST\Functions\FunctionNode;
use Doctrine\ORM\Query\AST\InputParameter;
use Doctrine\ORM\Query\Lexer;
use Doctrine\ORM\Query\Parser;
use Doctrine\ORM\Query\SqlWalker;

/**
 * Class RegexpFunction
 * @package Blogger\BlogBundl\DoctrineFunctions
 *
 * DateDiffFunction ::= "regexp" "(" StringPrimary "," StringExpression ")"
 */
class RegexpFunction extends FunctionNode
{
    /**
     * @var mixed
     */
    private $regexp;

    /**
     * @var InputParameter
     */
    private $fieldName;

    /**
     * @param SqlWalker $sqlWalker
     *
     * @return string
     */
    public function getSql(SqlWalker $sqlWalker)
    {
        return '(' . $this->fieldName->dispatch($sqlWalker) . ' REGEXP ' .
        $this->regexp->dispatch($sqlWalker) . ')';
    }

    /**
     * @param Parser $parser
     */
    public function parse(Parser $parser)
    {
        $parser->match(Lexer::T_IDENTIFIER);
        $parser->match(Lexer::T_OPEN_PARENTHESIS);
        $this->regexp = $parser->StringPrimary();
        $parser->match(Lexer::T_COMMA);
        $this->fieldName = $parser->StringExpression();
        $parser->match(Lexer::T_CLOSE_PARENTHESIS);
    }
}