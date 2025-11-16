@extends('emails.layout')

@section('content')
    <h1 class="email-title">Reembolso procesado</h1>

    <div class="email-content">
        <p>Hola {{ $user->name }},</p>

        <p>Tu solicitud de reembolso ha sido procesada exitosamente.</p>
    </div>

    <div class="info-box">
        <div class="info-box-title">Detalles del reembolso</div>
        <div class="info-box-content">
            <table style="width: 100%; font-size: 15px;">
                <tr>
                    <td style="padding: 8px 0; color: #6a6a6a;">ID de transacción:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600;">{{ $refund['transaction_id'] ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6a6a6a;">Monto reembolsado:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #22c55e;">${{ number_format($refund['amount'], 2) }} {{ $refund['currency'] ?? 'MXN' }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6a6a6a;">Fecha de procesamiento:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600;">{{ $refund['processed_date'] ?? now()->format('d/m/Y') }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6a6a6a;">Método de devolución:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600;">{{ $refund['method'] ?? 'Método de pago original' }}</td>
                </tr>
                @if(isset($refund['reason']))
                <tr>
                    <td style="padding: 8px 0; color: #6a6a6a;">Motivo:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600;">{{ $refund['reason'] }}</td>
                </tr>
                @endif
            </table>
        </div>
    </div>

    <div class="info-box" style="background-color: #fefce8; border-left-color: #eab308;">
        <div class="info-box-title" style="color: #854d0e;">Tiempo de procesamiento</div>
        <div class="info-box-content">
            <p>El reembolso aparecerá en tu cuenta bancaria o estado de cuenta en los próximos <strong>{{ $refund['processing_days'] ?? '5-10' }} días hábiles</strong>, dependiendo de tu institución financiera.</p>
        </div>
    </div>

    @if(isset($refund['partial']) && $refund['partial'])
    <div class="email-content">
        <p><strong>Nota:</strong> Este es un reembolso proporcional basado en el tiempo no utilizado de tu suscripción.</p>
    </div>
    @endif

    <div class="divider"></div>

    <div class="email-content">
        <p><strong>¿Qué significa esto para tu cuenta?</strong></p>
        <ul style="margin-left: 20px; color: #4a4a4a;">
            @if(isset($refund['account_status']))
                @foreach($refund['account_status'] as $status)
                <li style="margin-bottom: 8px;">{{ $status }}</li>
                @endforeach
            @else
                <li style="margin-bottom: 8px;">Tu suscripción ha sido cancelada</li>
                <li style="margin-bottom: 8px;">Tus datos permanecerán guardados por 30 días</li>
                <li style="margin-bottom: 8px;">Puedes reactivar tu cuenta en cualquier momento</li>
            @endif
        </ul>
    </div>

    <div class="divider"></div>

    <div class="email-content">
        <p>Lamentamos verte partir. Si decides volver en el futuro, siempre serás bienvenido.</p>
    </div>

    <div style="text-align: center;">
        <a href="{{ config('app.url') }}/dashboard" class="email-button email-button-secondary">
            Acceder a mi cuenta
        </a>
    </div>

    <div class="divider"></div>

    <div class="email-content">
        <p style="font-size: 14px; color: #6a6a6a;">
            Si tienes preguntas sobre este reembolso, contáctanos en
            <a href="mailto:billing@nutricoach.com" style="color: #22c55e;">billing@nutricoach.com</a>
        </p>
    </div>
@endsection
