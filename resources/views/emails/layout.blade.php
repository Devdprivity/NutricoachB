<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ $subject ?? 'Gidia.app' }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background-color: #f5f5f5;
        }

        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }

        .email-header {
            background-color: #ffffff;
            padding: 40px 30px;
            border-bottom: 3px solid #22c55e;
            text-align: center;
        }

        .email-logo {
            font-size: 28px;
            font-weight: 700;
            color: #1a1a1a;
            letter-spacing: -0.5px;
        }

        .email-logo span {
            color: #22c55e;
        }

        .email-body {
            padding: 40px 30px;
        }

        .email-title {
            font-size: 24px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 20px;
            line-height: 1.3;
        }

        .email-content {
            font-size: 16px;
            color: #4a4a4a;
            margin-bottom: 20px;
        }

        .email-content p {
            margin-bottom: 15px;
        }

        .email-button {
            display: inline-block;
            padding: 14px 32px;
            background-color: #22c55e;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: background-color 0.3s ease;
        }

        .email-button:hover {
            background-color: #16a34a;
        }

        .email-button-secondary {
            background-color: #1a1a1a;
        }

        .email-button-secondary:hover {
            background-color: #2a2a2a;
        }

        .info-box {
            background-color: #f0fdf4;
            border-left: 4px solid #22c55e;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }

        .info-box-title {
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 10px;
        }

        .info-box-content {
            color: #4a4a4a;
            font-size: 15px;
        }

        .warning-box {
            background-color: #fefce8;
            border-left: 4px solid #eab308;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }

        .stats-container {
            display: table;
            width: 100%;
            margin: 25px 0;
        }

        .stat-item {
            display: table-cell;
            text-align: center;
            padding: 20px;
            background-color: #f9f9f9;
            border-right: 1px solid #e5e5e5;
        }

        .stat-item:last-child {
            border-right: none;
        }

        .stat-number {
            font-size: 32px;
            font-weight: 700;
            color: #22c55e;
            display: block;
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 14px;
            color: #6a6a6a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .divider {
            height: 1px;
            background-color: #e5e5e5;
            margin: 30px 0;
        }

        .email-footer {
            background-color: #f9f9f9;
            padding: 30px;
            border-top: 1px solid #e5e5e5;
            text-align: center;
        }

        .footer-text {
            font-size: 14px;
            color: #6a6a6a;
            margin-bottom: 15px;
        }

        .footer-links {
            margin: 15px 0;
        }

        .footer-link {
            color: #22c55e;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
        }

        .social-links {
            margin: 20px 0;
        }

        .social-link {
            display: inline-block;
            margin: 0 8px;
            color: #6a6a6a;
            text-decoration: none;
        }

        .copyright {
            font-size: 12px;
            color: #9a9a9a;
            margin-top: 20px;
        }

        @media only screen and (max-width: 600px) {
            .email-header {
                padding: 30px 20px;
            }

            .email-body {
                padding: 30px 20px;
            }

            .email-title {
                font-size: 20px;
            }

            .email-button {
                display: block;
                text-align: center;
            }

            .stat-item {
                display: block;
                border-right: none;
                border-bottom: 1px solid #e5e5e5;
            }

            .stat-item:last-child {
                border-bottom: none;
            }
        }
    </style>
</head>
<body>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
            <td align="center">
                <div class="email-wrapper">
                    <!-- Header -->
                    <div class="email-header">
                        <div class="email-logo">
                            Gidia<span>.app</span>
                        </div>
                    </div>

                    <!-- Body -->
                    <div class="email-body">
                        @yield('content')
                    </div>

                    <!-- Footer -->
                    <div class="email-footer">
                        <p class="footer-text">
                            Este correo fue enviado por Gidia.app
                        </p>

                        <div class="footer-links">
                            <a href="{{ config('app.url') }}/help" class="footer-link">Centro de Ayuda</a>
                            <a href="{{ config('app.url') }}/privacy" class="footer-link">Privacidad</a>
                            <a href="{{ config('app.url') }}/terms" class="footer-link">Términos</a>
                        </div>

                        <div class="social-links">
                            <a href="#" class="social-link">Twitter</a>
                            <a href="#" class="social-link">Facebook</a>
                            <a href="#" class="social-link">Instagram</a>
                        </div>

                        <p class="copyright">
                            © {{ date('Y') }} Gidia.app. Todos los derechos reservados.
                        </p>

                        <p class="footer-text" style="margin-top: 15px; font-size: 12px;">
                            Si no deseas recibir estos correos, puedes <a href="{{ config('app.url') }}/settings/notifications" style="color: #22c55e;">ajustar tus preferencias</a>.
                        </p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
