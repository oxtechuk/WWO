<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CreateAdminCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'wox:create-admin 
                            {email? : The admin email} 
                            {--name=Super Admin : The admin name} 
                            {--password= : The admin password}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create or reset a super administrator account securely';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = $this->argument('email') ?? $this->ask('Enter admin email address');
        $name = $this->option('name') ?: 'Super Admin';
        $password = $this->option('password') ?? $this->secret('Enter admin password (min 8 characters)');

        $validator = Validator::make([
            'email'    => $email,
            'password' => $password,
        ], [
            'email'    => ['required', 'email'],
            'password' => ['required', 'min:8'],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }
            return self::FAILURE;
        }

        $email = strtolower(trim($email));
        $user = User::where('email', $email)->first();

        if ($user) {
            if ($this->confirm("User [{$email}] already exists. Would you like to update their password to administrator?", true)) {
                $user->update([
                    'password' => Hash::make($password),
                    'name'     => $name,
                ]);
                $this->info("✅ Admin password for [{$email}] updated successfully!");
                return self::SUCCESS;
            }
            return self::INVALID;
        }

        User::create([
            'name'     => $name,
            'email'    => $email,
            'password' => Hash::make($password),
        ]);

        $this->info("✅ Super administrator [{$email}] created successfully!");

        return self::SUCCESS;
    }
}
