<?php

namespace App\Models;

use App\Enums\InstanceConnectionStatus;
use App\Traits\HasCuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Instance Model — core multi-tenant entity.
 * Mirrors Wox-Ox Prisma Instance model exactly.
 *
 * @property string $id
 * @property string $name
 * @property InstanceConnectionStatus $connectionStatus
 * @property string|null $ownerJid
 * @property string|null $profileName
 * @property string|null $profilePicUrl
 * @property string|null $integration
 * @property string|null $number
 * @property string|null $businessId
 * @property string|null $token
 * @property string|null $clientName
 */
class Instance extends Model
{
    use HasCuid, HasFactory;

    protected $table = 'Instance';
    public $timestamps = false;

    protected $fillable = [
        'id', 'name', 'connectionStatus', 'ownerJid', 'profileName',
        'profilePicUrl', 'integration', 'number', 'businessId',
        'token', 'clientName', 'disconnectionReasonCode',
        'disconnectionObject', 'disconnectionAt', 'createdAt', 'updatedAt',
    ];

    protected $casts = [
        'connectionStatus'   => InstanceConnectionStatus::class,
        'disconnectionObject' => 'array',
        'disconnectionAt'    => 'datetime',
        'createdAt'          => 'datetime',
        'updatedAt'          => 'datetime',
    ];

    // ─── Relations ───────────────────────────────────────────────

    public function chats(): HasMany
    {
        return $this->hasMany(Chat::class, 'instanceId');
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class, 'instanceId');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'instanceId');
    }

    public function messageUpdates(): HasMany
    {
        return $this->hasMany(MessageUpdate::class, 'instanceId');
    }

    public function media(): HasMany
    {
        return $this->hasMany(Media::class, 'instanceId');
    }

    public function labels(): HasMany
    {
        return $this->hasMany(Label::class, 'instanceId');
    }

    public function session(): HasOne
    {
        return $this->hasOne(WhatsAppSession::class, 'sessionId');
    }

    public function webhook(): HasOne
    {
        return $this->hasOne(Webhook::class, 'instanceId');
    }

    public function setting(): HasOne
    {
        return $this->hasOne(Setting::class, 'instanceId');
    }

    public function proxy(): HasOne
    {
        return $this->hasOne(Proxy::class, 'instanceId');
    }

    public function chatwoot(): HasOne
    {
        return $this->hasOne(Chatwoot::class, 'instanceId');
    }

    public function rabbitmq(): HasOne
    {
        return $this->hasOne(Rabbitmq::class, 'instanceId');
    }

    public function nats(): HasOne
    {
        return $this->hasOne(Nats::class, 'instanceId');
    }

    public function sqs(): HasOne
    {
        return $this->hasOne(Sqs::class, 'instanceId');
    }

    public function kafka(): HasOne
    {
        return $this->hasOne(Kafka::class, 'instanceId');
    }

    public function websocket(): HasOne
    {
        return $this->hasOne(Websocket::class, 'instanceId');
    }

    public function pusher(): HasOne
    {
        return $this->hasOne(Pusher::class, 'instanceId');
    }

    public function typebots(): HasMany
    {
        return $this->hasMany(Typebot::class, 'instanceId');
    }

    public function typebotSetting(): HasOne
    {
        return $this->hasOne(TypebotSetting::class, 'instanceId');
    }

    public function openaiCreds(): HasMany
    {
        return $this->hasMany(OpenaiCreds::class, 'instanceId');
    }

    public function openaiBots(): HasMany
    {
        return $this->hasMany(OpenaiBot::class, 'instanceId');
    }

    public function openaiSetting(): HasOne
    {
        return $this->hasOne(OpenaiSetting::class, 'instanceId');
    }

    public function difys(): HasMany
    {
        return $this->hasMany(Dify::class, 'instanceId');
    }

    public function difySetting(): HasOne
    {
        return $this->hasOne(DifySetting::class, 'instanceId');
    }

    public function evolutionBots(): HasMany
    {
        return $this->hasMany(EvolutionBot::class, 'instanceId');
    }

    public function evolutionBotSetting(): HasOne
    {
        return $this->hasOne(EvolutionBotSetting::class, 'instanceId');
    }

    public function flowises(): HasMany
    {
        return $this->hasMany(Flowise::class, 'instanceId');
    }

    public function flowiseSetting(): HasOne
    {
        return $this->hasOne(FlowiseSetting::class, 'instanceId');
    }

    public function n8ns(): HasMany
    {
        return $this->hasMany(N8n::class, 'instanceId');
    }

    public function n8nSetting(): HasOne
    {
        return $this->hasOne(N8nSetting::class, 'instanceId');
    }

    public function evoais(): HasMany
    {
        return $this->hasMany(Evoai::class, 'instanceId');
    }

    public function evoaiSetting(): HasOne
    {
        return $this->hasOne(EvoaiSetting::class, 'instanceId');
    }

    public function templates(): HasMany
    {
        return $this->hasMany(Template::class, 'instanceId');
    }

    public function integrationSessions(): HasMany
    {
        return $this->hasMany(IntegrationSession::class, 'instanceId');
    }

    // ─── Helpers ─────────────────────────────────────────────────

    public function isConnected(): bool
    {
        return $this->connectionStatus === InstanceConnectionStatus::Open;
    }

    public function getStatusLabel(): string
    {
        return $this->connectionStatus->label();
    }
}
