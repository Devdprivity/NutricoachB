@extends('emails.layout')

@section('content')
    <h1 class="email-title">Problema con tu pago</h1>

    <div class="email-content">
        <p>Hola {{ $user->name }},</p>

        <p>Intentamos procesar el pago de tu suscripción a <strong>{{ $subscription['plan_name'] }}</strong>, pero no pudimos completarlo.</p>
    </div>

    <div class="warning-box">
        <div class="info-box-title" style="color: #854d0e;">Acción requerida</div>
        <div class="info-box-content">
            <p><strong>Monto pendiente:</strong> ${{ number_format($subscription['amount'], 2) }} {{ $subscription['currency'] ?? 'MXN' }}</p>
            <p style="margin-top: 10px;"><strong>Fecha de intento:</strong> {{ $payment['attempt_date'] ?? now()->format('d/m/Y') }}</p>
            @if(isset($payment['error_message']))
            <p style="margin-top: 10px;"><strong>Razón:</strong> {{ $payment['error_message'] }}</p>
            @endif
        </div>
    </div>

    <div class="email-content">
        <p><strong>Posibles causas:</strong></p>
        <ul style="margin-left: 20px; color: #4a4a4a;">
            <li style="margin-bottom: 8px;">Fondos insuficientes en tu cuenta</li>
            <li style="margin-bottom: 8px;">Tarjeta vencida o bloqueada</li>
            <li style="margin-bottom: 8px;">Información de pago incorrecta</li>
            <li style="margin-bottom: 8px;">Límite de crédito alcanzado</li>
        </ul>
    </div>

    <div class="info-box">
        <div class="info-box-title">¿Qué sucede ahora?</div>
        <div class="info-box-content">
            <p style="margin-bottom: 10px;">• <strong>Reintentaremos el cargo</strong> en {{ $payment['retry_days'] ?? 3 }} días</p>
            <p style="margin-bottom: 10px;">• Tienes hasta el <strong>{{ $payment['grace_period_end'] ?? now()->addDays(7)->format('d/m/Y') }}</strong> para actualizar tu método de pago</p>
            <p style="margin-bottom: 0;">• Después de esa fecha, tu acceso a funciones premium será suspendido temporalmente</p>
        </div>
    </div>

    <div class="email-content">
        <p><strong>Actualiza tu método de pago ahora</strong> para evitar la interrupción de tu servicio:</p>
    </div>

    <div style="text-align: center;">
        <a href="{{ config('app.url') }}/settings/payment-methods" class="email-button">
            Actualizar método de pago
        </a>
    </div>

    <div class="divider"></div>

    <div class="email-content">
        <p style="font-size: 14px; color: #6a6a6a;">
            <strong>¿Necesitas ayuda?</strong> Nuestro equipo de facturación está disponible para asistirte en
            <a href="mailto:billing@gidia.app" style="color: #22c55e;">billing@gidia.app</a>
        </p>
    </div>
@endsection
