<?php

namespace App\Models;

use App\Traits\HasCuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Setting extends Model
{
    use HasCuid;

    protected $table = 'Setting';
    public $timestamps = false;

    protected $fillable = [
        'id', 'rejectCall', 'msgCall', 'groupsIgnore', 'alwaysOnline',
        'readMessages', 'readStatus', 'syncFullHistory', 'instanceId',
    ];

    protected $casts = [
        'rejectCall'      => 'boolean',
        'groupsIgnore'    => 'boolean',
        'alwaysOnline'    => 'boolean',
        'readMessages'    => 'boolean',
        'readStatus'      => 'boolean',
        'syncFullHistory' => 'boolean',
    ];

    public function instance(): BelongsTo
    {
        return $this->belongsTo(Instance::class, 'instanceId');
    }
}
