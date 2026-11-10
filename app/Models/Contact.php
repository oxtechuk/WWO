<?php

namespace App\Models;

use App\Traits\HasCuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contact extends Model
{
    use HasCuid;

    protected $table = 'Contact';
    public $timestamps = false;

    protected $fillable = [
        'id', 'remoteJid', 'pushName', 'profilePicUrl',
        'instanceId', 'createdAt', 'updatedAt',
    ];

    protected $casts = [
        'createdAt' => 'datetime',
        'updatedAt' => 'datetime',
    ];

    public function instance(): BelongsTo
    {
        return $this->belongsTo(Instance::class, 'instanceId');
    }
}
