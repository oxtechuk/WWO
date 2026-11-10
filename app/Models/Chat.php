<?php

namespace App\Models;

use App\Traits\HasCuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Chat extends Model
{
    use HasCuid;

    protected $table = 'Chat';
    public $timestamps = false;

    protected $fillable = [
        'id', 'remoteJid', 'name', 'labels',
        'instanceId', 'unreadMessages', 'createdAt', 'updatedAt',
    ];

    protected $casts = [
        'labels'    => 'array',
        'createdAt' => 'datetime',
        'updatedAt' => 'datetime',
    ];

    public function instance(): BelongsTo
    {
        return $this->belongsTo(Instance::class, 'instanceId');
    }
}
