<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProgressUpdateMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public User $user;
    public array $stats;
    public array $achievements;
    public array $comparison;
    public array $recommendations;

    /**
     * Create a new message instance.
     */
    public function __construct(
        User $user,
        array $stats,
        array $achievements = [],
        array $comparison = [],
        array $recommendations = []
    ) {
        $this->user = $user;
        $this->stats = $stats;
        $this->achievements = $achievements;
        $this->comparison = $comparison;
        $this->recommendations = $recommendations;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Resumen de tu progreso semanal - NutriCoach',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.progress-update',
            with: [
                'user' => $this->user,
                'stats' => $this->stats,
                'achievements' => $this->achievements,
                'comparison' => $this->comparison,
                'recommendations' => $this->recommendations,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
