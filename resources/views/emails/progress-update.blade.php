@extends('emails.layout')

@section('content')
    <h1 class="email-title">Resumen de tu progreso semanal</h1>

    <div class="email-content">
        <p>Hola {{ $user->name }},</p>

        <p>¡Excelente trabajo esta semana! Aquí está el resumen de tu actividad y progreso:</p>
    </div>

    <div class="stats-container">
        <div class="stat-item">
            <span class="stat-number">{{ $stats['days_active'] ?? 0 }}</span>
            <span class="stat-label">Días activos</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">{{ $stats['meals_logged'] ?? 0 }}</span>
            <span class="stat-label">Comidas</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">{{ $stats['exercises_completed'] ?? 0 }}</span>
            <span class="stat-label">Ejercicios</span>
        </div>
    </div>

    @if(isset($achievements) && count($achievements) > 0)
    <div class="info-box">
        <div class="info-box-title">🏆 Logros de esta semana</div>
        <div class="info-box-content">
            @foreach($achievements as $achievement)
            <p style="margin-bottom: 8px;">✓ {{ $achievement }}</p>
            @endforeach
        </div>
    </div>
    @endif

    <div class="email-content">
        <p><strong>Comparado con la semana anterior:</strong></p>
        <ul style="margin-left: 20px; color: #4a4a4a;">
            @if(isset($comparison['calories']))
            <li style="margin-bottom: 8px;">Calorías promedio: {{ $comparison['calories'] > 0 ? '+' : '' }}{{ $comparison['calories'] }}%</li>
            @endif
            @if(isset($comparison['weight']))
            <li style="margin-bottom: 8px;">Peso: {{ $comparison['weight'] > 0 ? '+' : '' }}{{ $comparison['weight'] }} kg</li>
            @endif
            @if(isset($comparison['streak']))
            <li style="margin-bottom: 8px;">Racha actual: {{ $comparison['streak'] }} días consecutivos</li>
            @endif
        </ul>
    </div>

    @if(isset($recommendations) && count($recommendations) > 0)
    <div class="divider"></div>

    <div class="email-content">
        <p><strong>Recomendaciones para la próxima semana:</strong></p>
        <ol style="margin-left: 20px; color: #4a4a4a;">
            @foreach($recommendations as $recommendation)
            <li style="margin-bottom: 8px;">{{ $recommendation }}</li>
            @endforeach
        </ol>
    </div>
    @endif

    <div style="text-align: center;">
        <a href="{{ config('app.url') }}/progress" class="email-button">
            Ver progreso completo
        </a>
    </div>

    <div class="divider"></div>

    <div class="email-content">
        <p style="font-size: 14px; color: #6a6a6a;">
            <strong>Consejo:</strong> La consistencia es clave. Mantén el ritmo y sigue registrando tu actividad diaria.
        </p>
    </div>
@endsection
