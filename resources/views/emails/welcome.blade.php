@extends('emails.layout')

@section('content')
    <h1 class="email-title">¡Bienvenido a NutriCoach, {{ $user->name }}!</h1>

    <div class="email-content">
        <p>Nos emociona tenerte como parte de nuestra comunidad. Estás a punto de comenzar un viaje transformador hacia una vida más saludable.</p>

        <p>Con NutriCoach tendrás acceso a:</p>
    </div>

    <div class="info-box">
        <div class="info-box-content">
            <p style="margin-bottom: 10px;"><strong>✓ Seguimiento nutricional personalizado</strong><br>Registra tus comidas y monitorea tus macros en tiempo real</p>
            <p style="margin-bottom: 10px;"><strong>✓ Planes de ejercicio adaptados</strong><br>Rutinas diseñadas para tus objetivos específicos</p>
            <p style="margin-bottom: 10px;"><strong>✓ Coaching con IA</strong><br>Guía personalizada disponible 24/7</p>
            <p style="margin-bottom: 0;"><strong>✓ Comunidad activa</strong><br>Conecta con personas que comparten tus metas</p>
        </div>
    </div>

    <div class="email-content">
        <p><strong>Primeros pasos recomendados:</strong></p>
        <ol style="margin-left: 20px; color: #4a4a4a;">
            <li style="margin-bottom: 8px;">Completa tu perfil con tus datos de salud y objetivos</li>
            <li style="margin-bottom: 8px;">Registra tu primera comida del día</li>
            <li style="margin-bottom: 8px;">Explora los planes de entrenamiento disponibles</li>
            <li style="margin-bottom: 8px;">Conecta con otros usuarios en la comunidad</li>
        </ol>
    </div>

    <div style="text-align: center;">
        <a href="{{ config('app.url') }}/dashboard" class="email-button">
            Comenzar ahora
        </a>
    </div>

    <div class="divider"></div>

    <div class="email-content">
        <p style="font-size: 14px; color: #6a6a6a;">
            ¿Necesitas ayuda para comenzar? Nuestro equipo de soporte está disponible en
            <a href="mailto:support@nutricoach.com" style="color: #22c55e;">support@nutricoach.com</a>
        </p>
    </div>
@endsection
