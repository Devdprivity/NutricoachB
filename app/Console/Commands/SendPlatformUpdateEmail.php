<?php

namespace App\Console\Commands;

use App\Mail\PlatformUpdateMail;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendPlatformUpdateEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:send-platform-update
                            {title : The title of the update}
                            {--message= : Main message or announcement}
                            {--features=* : List of new features}
                            {--improvements=* : List of improvements}
                            {--fixes=* : List of bug fixes}
                            {--user= : Send to specific user ID only}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send platform update announcement email to all users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $title = $this->argument('title');
        $message = $this->option('message') ?? 'Hemos lanzado nuevas actualizaciones en Gidia.app';

        $features = $this->option('features') ?? [];
        $improvements = $this->option('improvements') ?? [];
        $fixes = $this->option('fixes') ?? [];

        // Si no se proporcionaron features, improvements o fixes, solicitarlos interactivamente
        if (empty($features) && empty($improvements) && empty($fixes)) {
            $this->info('No features, improvements or fixes provided. Let\'s add some interactively.');

            // Agregar features
            $this->info("\nAdd new features (press Enter with empty value to skip):");
            while (true) {
                $feature = $this->ask('New feature (or press Enter to continue)');
                if (empty($feature)) break;
                $features[] = $feature;
            }

            // Agregar improvements
            $this->info("\nAdd improvements (press Enter with empty value to skip):");
            while (true) {
                $improvement = $this->ask('Improvement (or press Enter to continue)');
                if (empty($improvement)) break;
                $improvements[] = $improvement;
            }

            // Agregar bug fixes
            $this->info("\nAdd bug fixes (press Enter with empty value to skip):");
            while (true) {
                $fix = $this->ask('Bug fix (or press Enter to continue)');
                if (empty($fix)) break;
                $fixes[] = $fix;
            }
        }

        // Preparar datos de actualización
        $updateData = [
            'title' => $title,
            'message' => $message,
            'date' => now()->format('Y-m-d'),
            'version' => config('app.version', '1.0.0'),
            'features' => $features,
            'improvements' => $improvements,
            'fixes' => $fixes,
        ];

        // Mostrar resumen
        $this->info("\n=== Platform Update Email ===");
        $this->info("Title: {$title}");
        $this->info("Message: {$message}");
        $this->info("Features: " . count($features));
        $this->info("Improvements: " . count($improvements));
        $this->info("Bug Fixes: " . count($fixes));
        $this->newLine();

        if (!$this->confirm('Do you want to send this email to users?', true)) {
            $this->warn('Email sending cancelled.');
            return Command::FAILURE;
        }

        $this->info('Starting platform update email sending...');

        // Obtener usuarios
        if ($userId = $this->option('user')) {
            $users = User::where('id', $userId)->get();
        } else {
            // Enviar a todos los usuarios con email verificado
            $users = User::whereNotNull('email_verified_at')->get();
        }

        $sent = 0;
        $failed = 0;
        $bar = $this->output->createProgressBar($users->count());
        $bar->start();

        foreach ($users as $user) {
            try {
                Mail::to($user->email)->send(new PlatformUpdateMail($user, $updateData));

                $sent++;
                $bar->advance();

                \Log::info('Platform update email sent', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'update_title' => $title,
                ]);

            } catch (\Exception $e) {
                $failed++;
                $bar->advance();

                \Log::error('Failed to send platform update email', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Platform update email sending completed!");
        $this->info("Sent: {$sent}");
        $this->info("Failed: {$failed}");
        $this->info("Total users processed: " . $users->count());

        return Command::SUCCESS;
    }
}
