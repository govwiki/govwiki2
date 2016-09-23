<?php

namespace GovWiki\DbBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Monetization
 *
 * @ORM\Table(name="monetizations")
 * @ORM\Entity
 */
class Monetization
{

    const TYPE_ADVERTISING = 'advertising';
    const TYPE_DONATION_BUTTON = 'donation_button';

    const POSITION_TOP = 'top';
    const POSITION_MIDDLE = 'middle';
    const POSITION_BOTTOM = 'bottom';
    const POSITION_FOOTER = 'footer';

    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var Environment
     *
     * @ORM\ManyToOne(targetEntity="Environment", inversedBy="monetization")
     * @Assert\NotNull
     */
    private $environment;

    /**
     * @var string
     *
     * @ORM\Column(length=255)
     */
    private $type;

    /**
     * @var string
     *
     * @ORM\Column(type="boolean")
     */
    private $enable = false;

    /**
     * @var string
     *
     * @ORM\Column(type="text")
     * @Assert\NotBlank
     */
    private $code;

    /**
     * @var string
     *
     * @ORM\Column
     * @Assert\NotBlank
     */
    private $position = self::POSITION_TOP;

    /**
     * @return array
     */
    public static function getAvailableType()
    {
        return [
            self::TYPE_ADVERTISING => self::TYPE_ADVERTISING,
            self::TYPE_DONATION_BUTTON => self::TYPE_DONATION_BUTTON,
        ];
    }

    /**
     * @return array
     */
    public static function getAvailablePosition()
    {
        return [
            self::POSITION_TOP => self::POSITION_TOP,
            self::POSITION_MIDDLE => self::POSITION_MIDDLE,
            self::POSITION_BOTTOM => self::POSITION_BOTTOM,
            self::POSITION_FOOTER => self::POSITION_FOOTER,
        ];
    }

    /**
     * @param string $position Position to check.
     *
     * @return void
     */
    public static function validatePosition($position)
    {
        if (! in_array($position, self::getAvailablePosition(), true)) {
            $message = "Invalid position {$position}. Expect: "
                . join(', ', Monetization::getAvailablePosition());
            throw new \InvalidArgumentException($message);
        }
    }

    /**
     * Factory method for creating advertising.
     *
     * @param Environment $environment A Environment entity instance.
     *
     * @return Monetization
     */
    public static function createAdvertising(Environment $environment)
    {
        $advertising = new Monetization();
        $advertising
            ->setEnvironment($environment)
            ->setType(self::TYPE_ADVERTISING);

        return $advertising;
    }

    /**
     * Factory method for creating donation button.
     *
     * @param Environment $environment A Environment entity instance.
     *
     * @return Monetization
     */
    public static function createDonationButton(Environment $environment)
    {
        $button = new Monetization();
        $button
            ->setEnvironment($environment)
            ->setType(self::TYPE_DONATION_BUTTON)
            ->setPosition(self::POSITION_BOTTOM);

        return $button;
    }

    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set type
     *
     * @param string $type Monetization type, all available type declare in
     *                     {@see Monetization::getAvailableType()}.
     *
     * @return Monetization
     */
    public function setType($type)
    {
        $this->type = $type;

        return $this;
    }

    /**
     * Get type
     *
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @return boolean
     */
    public function isAdvertising()
    {
        return $this->type === self::TYPE_ADVERTISING;
    }

    /**
     * @return boolean
     */
    public function isDonationButton()
    {
        return $this->type === self::TYPE_DONATION_BUTTON;
    }

    /**
     * Set enable
     *
     * @param boolean $enable Flag, if set this monetization code will be inject
     *                        in site page.
     *
     * @return Monetization
     */
    public function setEnable($enable)
    {
        $this->enable = $enable;

        return $this;
    }

    /**
     * Get enable
     *
     * @return boolean
     */
    public function isEnable()
    {
        return $this->enable;
    }

    /**
     * Set code
     *
     * @param string $code Monetization code generated in site like Google Ad
     *                     Sense or PayPal.
     *
     * @return Monetization
     */
    public function setCode($code)
    {
        $this->code = $code;

        return $this;
    }

    /**
     * Get code
     *
     * @return string
     */
    public function getCode()
    {
        return $this->code;
    }

    /**
     * Set environment
     *
     * @param Environment $environment A Environment entity instance.
     * @return Monetization
     */
    public function setEnvironment(Environment $environment = null)
    {
        $this->environment = $environment;

        return $this;
    }

    /**
     * Get environment
     *
     * @return Environment
     */
    public function getEnvironment()
    {
        return $this->environment;
    }

    /**
     * Set position
     *
     * @param string $position Where this monetization element will appear on
     *                         page.
     *
     * @return Monetization
     */
    public function setPosition($position)
    {
        $this->position = $position;

        return $this;
    }

    /**
     * Get position
     *
     * @return string
     */
    public function getPosition()
    {
        return $this->position;
    }

    /**
     * @param string $position Checked position.
     *
     * @return boolean
     */
    public function isOnPosition($position)
    {
        self::validatePosition($position);

        return $this->position === $position;
    }
}
