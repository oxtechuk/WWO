<?php

namespace App\Models;

use App\Enums\DeviceMessage;
use App\Traits\HasCuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Message extends Model
{
    use HasCuid;

    protected $table = 'Message';
    public $timestamps = false;

    protected $fillable = [
        'id', 'key', 'pushName', 'participant', 'messageType', 'message',
        'contextInfo', 'source', 'messageTimestamp', 'chatwootMessageId',
        'chatwootInboxId', 'chatwootConversationId', 'chatwootContactInboxSourceId',
        'chatwootIsRead', 'instanceId', 'typebotSessionId', 'webhookUrl',
        'status', 'sessionId',
    ];

    protected $casts = [
        'key'             => 'array',
        'message'         => 'array',
        'contextInfo'     => 'array',
        'source'          => DeviceMessage::class,
        'chatwootIsRead'  => 'boolean',
    ];

    public function instance(): BelongsTo
    {
        return $this->belongsTo(Instance::class, 'instanceId');
    }

    public function updates(): HasMany
    {
        return $this->hasMany(MessageUpdate::class, 'messageId');
    }

    public function media(): HasOne
    {
        return $this->hasOne(Media::class, 'messageId');
    }

    public function integrationSession(): BelongsTo
    {
        return $this->belongsTo(IntegrationSession::class, 'sessionId');
    }
}
