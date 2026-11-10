<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * TenantScope — ensures Eloquent queries are automatically isolated
 * by instanceId when operating in tenant context.
 */
class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        // 1. Check if request has an attached instance
        if ($instance = request()->get('wox_instance')) {
            $builder->where($model->getTable() . '.instanceId', $instance->id);
            return;
        }

        // 2. Check route parameters (instanceName or instanceId)
        if ($instanceName = request()->route('instanceName')) {
            $builder->whereHas('instance', function (Builder $query) use ($instanceName) {
                $query->where('name', $instanceName);
            });
        }
    }
}
