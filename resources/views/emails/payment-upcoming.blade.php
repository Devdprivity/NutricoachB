@extends('emails.layout')

@section('content')
    <h1 class="email-title">Próximo cargo de suscripción</h1>

    <div class="email-content">
        <p>Hola {{ $user->name }},</p>

        <p>Te informamos que tu suscripción a <strong>{{ $subscription['plan_name'] }}</strong> se renovará automáticamente pronto.</p>
    </div>

    <div class="info-box">
        <div class="info-box-title">Detalles del cargo</div>
        <div class="info-box-content">
            <table style="width: 100%; font-size: 15px;">
                <tr>
                    <td style="padding: 8px 0; color: #6a6a6a;">Plan:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600;">{{ $subscription['plan_name'] }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6a6a6a;">Monto:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #22c55e;">${{ number_format($subscription['amount'], 2) }} {{ $subscription['currency'] ?? 'MXN' }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6a6a6a;">Fecha de cargo:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600;">{{ $subscription['next_billing_date'] }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6a6a6a;">Método de pago:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600;">{{ $subscription['payment_method'] }}</td>
                </tr>
            </table>
        </div>
    </div>

    <div class="email-content">
        <p><strong>¿Qué incluye tu plan?</strong></p>
        <ul style="margin-left: 20px; color: #4a4a4a;">
            @if(isset($subscription['features']))
                @foreach($subscription['features'] as $feature)
                <li style="margin-bottom: 8px;">{{ $feature }}</li>
                @endforeach
            @else
                <li style="margin-bottom: 8px;">Acceso completo a planes de nutrición y ejercicio</li>
                <li style="margin-bottom: 8px;">Coaching personalizado con IA</li>
                <li style="margin-bottom: 8px;">Seguimiento detallado de progreso</li>
                <li style="margin-bottom: 8px;">Soporte prioritario</li>
            @endif
        </ul>
    </div>

    <div class="divider"></div>

    <div class="email-content">
        <p><strong>¿Necesitas hacer cambios?</strong></p>
        <p>Puedes actualizar tu método de pago, cambiar de plan o cancelar tu suscripción en cualquier momento desde tu cuenta.</p>
    </div>

    <div style="text-align: center;">
        <a href="{{ config('app.url') }}/settings/subscription" class="email-button">
            Administrar suscripción
        </a>
    </div>

    <div class="divider"></div>

    <div class="email-content">
        <p style="font-size: 14px; color: #6a6a6a;">
            Si tienes preguntas sobre tu suscripción, contáctanos en
            <a href="mailto:billing@nutricoach.com" style="color: #22c55e;">billing@nutricoach.com</a>
        </p>
    </div>
@endsection
