<?php

namespace GovWiki\CommentBundle\Form;

use Doctrine\ORM\EntityRepository;
use GovWiki\CommentBundle\Entity\VoteComment;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class VoteCommentType
 * @package GovWiki\DbBundle\Form
 */
class VoteCommentType extends AbstractType
{

    /**
     * @var integer
     */
    private $new;

    /**
     * @param boolean $new Flag, if set form used for creation new comment from
     *                     admin.
     */
    public function __construct($new = false)
    {
        $this->new = $new;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('body', 'ckeditor', [
            'config_name' => 'elected_official_comment_config',
        ]);

        if ($this->new) {
            /** @var VoteComment $comment */
            $comment = $builder->getData();
            $elected = $comment->getElected()->getId();

            $getQueryBuilder = function (EntityRepository $repository) use ($elected) {
                $qb = $repository->createQueryBuilder('Vote');
                $expr = $qb->expr();

                return $qb
                    ->select('partial Vote.{id}, partial Legislation.{id, name}')
                    ->join('Vote.legislation', 'Legislation')
                    ->where($expr->eq('Vote.electedOfficial', ':elected'))
                    ->setParameter('elected', $elected);
            };

            $builder->add('subject', 'entity', [
                'class' => 'GovWiki\DbBundle\Entity\ElectedOfficialVote',
                'label' => 'Vote for legislation',
                'choice_label' => 'legislation.name',
                'query_builder' => $getQueryBuilder,
            ]);
        }
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'GovWiki\CommentBundle\Entity\VoteComment',
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'govwiki_comment_vote_comment';
    }
}
