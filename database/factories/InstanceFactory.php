<?php

namespace Database\Factories;

use App\Enums\InstanceConnectionStatus;
use App\Traits\HasCuid;
use Illuminate\Database\Eloquent\Factories\Factory;
use Visus\Cuid2\Cuid2;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Instance>
 */
class InstanceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'id'               => (new Cuid2())->toString(),
            'name'             => 'instance-' . $this->faker->unique()->lexify('????????'),
            'connectionStatus' => InstanceConnectionStatus::Close,
            'ownerJid'         => null,
            'profileName'      => $this->faker->name(),
            'profilePicUrl'    => null,
            'integration'      => 'WHATSAPP-BAILEYS',
            'number'           => null,
            'businessId'       => null,
            'token'            => (new Cuid2())->toString(),
            'clientName'       => null,
        ];
    }

    /**
     * Instance in connected state.
     */
    public function connected(): static
    {
        return $this->state(fn(array $attr) => [
            'connectionStatus' => InstanceConnectionStatus::Open,
            'ownerJid'         => '55' . $this->faker->numerify('##########') . '@s.whatsapp.net',
        ]);
    }

    /**
     * Instance with a WhatsApp Business integration.
     */
    public function business(): static
    {
        return $this->state(fn(array $attr) => [
            'integration' => 'WHATSAPP-BUSINESS',
            'businessId'  => $this->faker->numerify('##############'),
        ]);
    }
}
