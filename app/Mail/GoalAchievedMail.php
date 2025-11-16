<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GoalAchievedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public User $user;
    public array $goal;
    public ?array $stats;
    public ?array $achievements;
    public ?string $reward;

    /**
     * Create a new message instance.
     */
    public function __construct(
        User $user,
        array $goal,
        ?array $stats = null,
        ?array $achievements = null,
        ?string $reward = null
    ) {
        $this->user = $user;
        $this->goal = $goal;
        $this->stats = $stats;
        $this->achievements = $achievements;
        $this->reward = $reward;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '¡Objetivo alcanzado! - NutriCoach',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.goal-achieved',
            with: [
                'user' => $this->user,
                'goal' => $this->goal,
                'stats' => $this->stats,
                'achievements' => $this->achievements,
                'reward' => $this->reward,
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
