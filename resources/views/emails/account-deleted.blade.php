@extends('emails.layout')

@section('content')
    <h1 class="email-title">Tu cuenta ha sido eliminada</h1>

    <div class="email-content">
        <p>Hola {{ $user->name }},</p>

        <p>Confirmamos que tu cuenta de NutriCoach ha sido eliminada exitosamente el {{ now()->format('d/m/Y') }} a las {{ now()->format('H:i') }}.</p>
    </div>

    <div class="info-box">
        <div class="info-box-title">¿Qué significa esto?</div>
        <div class="info-box-content">
            <p style="margin-bottom: 10px;">• Todos tus datos personales han sido eliminados de nuestros sistemas</p>
            <p style="margin-bottom: 10px;">• Tu historial de actividad, registros y progreso se han borrado permanentemente</p>
            <p style="margin-bottom: 10px;">• Ya no recibirás correos electrónicos de nuestra parte</p>
            <p style="margin-bottom: 0;">• Tu suscripción activa ha sido cancelada (si aplicaba)</p>
        </div>
    </div>

    <div class="email-content">
        <p><strong>Reembolsos:</strong></p>
        <p>Si tenías una suscripción activa, el reembolso proporcional (si aplica) será procesado en los próximos 5-7 días hábiles.</p>
    </div>

    <div class="divider"></div>

    <div class="email-content">
        <p><strong>¿Cambiaste de opinión?</strong></p>
        <p>Lamentamos verte partir. Si decides volver, siempre serás bienvenido a crear una nueva cuenta en cualquier momento.</p>
    </div>

    <div style="text-align: center;">
        <a href="{{ config('app.url') }}/register" class="email-button email-button-secondary">
            Volver a unirme
        </a>
    </div>

    <div class="divider"></div>

    <div class="email-content">
        <p style="font-size: 14px; color: #6a6a6a;">
            <strong>Feedback:</strong> Nos encantaría conocer tu opinión sobre tu experiencia con NutriCoach.
            <a href="mailto:feedback@nutricoach.com" style="color: #22c55e;">Envíanos tus comentarios</a>
        </p>

        <p style="font-size: 14px; color: #6a6a6a; margin-top: 15px;">
            Gracias por haber sido parte de nuestra comunidad. Te deseamos lo mejor en tu camino hacia la salud.
        </p>
    </div>
@endsection
