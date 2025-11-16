@extends('emails.layout')

@section('content')
    <h1 class="email-title">🎉 ¡Objetivo alcanzado!</h1>

    <div class="email-content">
        <p>Hola {{ $user->name }},</p>

        <p><strong>¡Felicitaciones! Has alcanzado tu objetivo:</strong></p>
    </div>

    <div class="info-box">
        <div class="info-box-title" style="font-size: 20px; color: #22c55e;">
            {{ $goal['title'] ?? 'Tu meta' }}
        </div>
        <div class="info-box-content">
            <p style="font-size: 16px; margin-top: 10px;">
                {{ $goal['description'] ?? 'Has completado tu objetivo exitosamente.' }}
            </p>
        </div>
    </div>

    @if(isset($stats))
    <div class="stats-container">
        @if(isset($stats['days_to_achieve']))
        <div class="stat-item">
            <span class="stat-number">{{ $stats['days_to_achieve'] }}</span>
            <span class="stat-label">Días</span>
        </div>
        @endif
        @if(isset($stats['total_workouts']))
        <div class="stat-item">
            <span class="stat-number">{{ $stats['total_workouts'] }}</span>
            <span class="stat-label">Entrenamientos</span>
        </div>
        @endif
        @if(isset($stats['weight_lost']))
        <div class="stat-item">
            <span class="stat-number">{{ $stats['weight_lost'] }}</span>
            <span class="stat-label">Kg perdidos</span>
        </div>
        @endif
    </div>
    @endif

    <div class="email-content">
        <p>Este logro es el resultado de tu dedicación, consistencia y esfuerzo. Deberías estar muy orgulloso de lo que has conseguido.</p>

        <p><strong>Lo que lograste:</strong></p>
        <ul style="margin-left: 20px; color: #4a4a4a;">
            @if(isset($achievements))
                @foreach($achievements as $achievement)
                <li style="margin-bottom: 8px;">{{ $achievement }}</li>
                @endforeach
            @else
                <li style="margin-bottom: 8px;">Mantuviste la constancia y disciplina necesaria</li>
                <li style="margin-bottom: 8px;">Superaste los desafíos que se presentaron</li>
                <li style="margin-bottom: 8px;">Desarrollaste nuevos hábitos saludables</li>
            @endif
        </ul>
    </div>

    @if(isset($reward))
    <div class="info-box" style="background-color: #fefce8; border-left-color: #eab308;">
        <div class="info-box-title">🎁 Recompensa desbloqueada</div>
        <div class="info-box-content">
            <p>{{ $reward }}</p>
        </div>
    </div>
    @endif

    <div class="divider"></div>

    <div class="email-content">
        <p><strong>¿Qué sigue ahora?</strong></p>
        <p>No te detengas aquí. Establece un nuevo objetivo y continúa tu transformación:</p>
    </div>

    <div style="text-align: center;">
        <a href="{{ config('app.url') }}/goals/new" class="email-button">
            Establecer nuevo objetivo
        </a>
    </div>

    <div class="divider"></div>

    <div class="email-content">
        <p style="font-size: 14px; color: #6a6a6a;">
            <strong>Comparte tu éxito:</strong> Tu historia puede inspirar a otros. Comparte tu logro con la comunidad.
        </p>
    </div>
@endsection
