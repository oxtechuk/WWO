<?php

namespace App\Models;

use App\Traits\HasCuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Webhook extends Model
{
    use HasCuid;

    protected $table = 'Webhook';
    public $timestamps = false;

    protected $fillable = [
        'id', 'url', 'enabled', 'events', 'webhookByEvents', 'webhookBase64', 'instanceId',
    ];

    protected $casts = [
        'enabled'        => 'boolean',
        'events'         => 'array',
        'webhookByEvents' => 'boolean',
        'webhookBase64'  => 'boolean',
    ];

    public function instance(): BelongsTo
    {
        return $this->belongsTo(Instance::class, 'instanceId');
    }
}
