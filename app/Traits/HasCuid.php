<?php

namespace App\Traits;

use Visus\Cuid2\Cuid2;

/**
 * Provides CUID2 as primary key — compatible with Wox-Ox Prisma CUID IDs.
 */
trait HasCuid
{
    /**
     * Boot the trait: auto-generate CUID on creating.
     */
    protected static function bootHasCuid(): void
    {
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (new Cuid2())->toString();
            }
        });
    }

    /**
     * Indicate the key is not auto-incrementing.
     */
    public function getIncrementing(): bool
    {
        return false;
    }

    /**
     * The key type is string.
     */
    public function getKeyType(): string
    {
        return 'string';
    }
}
