<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirigiendo...</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
        }
        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1.5rem;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        h1 {
            font-size: 1.5rem;
            margin: 0 0 0.5rem;
            font-weight: 600;
        }
        p {
            font-size: 1rem;
            opacity: 0.9;
            margin: 0;
        }
        .fallback {
            margin-top: 2rem;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            display: none;
        }
        .fallback a {
            color: white;
            text-decoration: underline;
            word-break: break-all;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
        <h1>Autenticación exitosa</h1>
        <p>Redirigiendo a la aplicación...</p>

        <div class="fallback" id="fallback">
            <p style="margin-bottom: 0.5rem;">Si no redirige automáticamente:</p>
            <a href="{{ $deepLinkUrl }}" id="manualLink">Abrir NutriCoach</a>
        </div>
    </div>

    <script>
        // Intentar redirección inmediata
        const deepLinkUrl = @json($deepLinkUrl);

        console.log('Redirigiendo a:', deepLinkUrl);

        // Cambiar la ubicación inmediatamente
        window.location.href = deepLinkUrl;

        // Mostrar fallback después de 2 segundos si no redirige
        setTimeout(() => {
            document.getElementById('fallback').style.display = 'block';
        }, 2000);

        // Intentar cerrar la ventana después de 3 segundos (para navegadores in-app)
        setTimeout(() => {
            try {
                window.close();
            } catch (e) {
                console.log('No se puede cerrar la ventana automáticamente');
            }
        }, 3000);
    </script>
</body>
</html>
