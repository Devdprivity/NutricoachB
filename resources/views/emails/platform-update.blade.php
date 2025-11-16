@extends('emails.layout')

@section('content')
    <h1 class="email-title">{{ $update['title'] ?? 'Nueva actualización de Gidia.app' }}</h1>

    <div class="email-content">
        <p>Hola {{ $user->name }},</p>

        <p>Nos complace anunciarte las últimas mejoras y novedades en Gidia.app.</p>
    </div>

    @if(isset($update['featured_image']))
    <div style="text-align: center; margin: 30px 0;">
        <img src="{{ $update['featured_image'] }}" alt="Actualización" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e5e5;">
    </div>
    @endif

    <div class="info-box">
        <div class="info-box-title">{{ $update['subtitle'] ?? 'Novedades principales' }}</div>
        <div class="info-box-content">
            <p>{{ $update['summary'] ?? 'Hemos implementado nuevas funcionalidades para mejorar tu experiencia.' }}</p>
        </div>
    </div>

    @if(isset($update['features']) && count($update['features']) > 0)
    <div class="email-content">
        <p><strong>¿Qué hay de nuevo?</strong></p>
        @foreach($update['features'] as $feature)
        <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 6px;">
            <div style="font-weight: 600; color: #1a1a1a; margin-bottom: 8px; font-size: 16px;">
                @if(isset($feature['icon']))
                {{ $feature['icon'] }}
                @endif
                {{ $feature['title'] }}
            </div>
            <div style="color: #4a4a4a; font-size: 14px;">
                {{ $feature['description'] }}
            </div>
        </div>
        @endforeach
    </div>
    @endif

    @if(isset($update['improvements']) && count($update['improvements']) > 0)
    <div class="email-content">
        <p><strong>Mejoras adicionales:</strong></p>
        <ul style="margin-left: 20px; color: #4a4a4a;">
            @foreach($update['improvements'] as $improvement)
            <li style="margin-bottom: 8px;">{{ $improvement }}</li>
            @endforeach
        </ul>
    </div>
    @endif

    @if(isset($update['bug_fixes']) && count($update['bug_fixes']) > 0)
    <div class="divider"></div>
    <div class="email-content">
        <p><strong>Correcciones:</strong></p>
        <ul style="margin-left: 20px; color: #6a6a6a; font-size: 14px;">
            @foreach($update['bug_fixes'] as $fix)
            <li style="margin-bottom: 6px;">{{ $fix }}</li>
            @endforeach
        </ul>
    </div>
    @endif

    @if(isset($update['cta_url']))
    <div style="text-align: center;">
        <a href="{{ $update['cta_url'] }}" class="email-button">
            {{ $update['cta_text'] ?? 'Explorar nuevas funciones' }}
        </a>
    </div>
    @endif

    <div class="divider"></div>

    <div class="email-content">
        <p><strong>Tus comentarios son importantes</strong></p>
        <p>¿Qué te parecen estas actualizaciones? Nos encantaría conocer tu opinión.</p>
    </div>

    <div style="text-align: center;">
        <a href="mailto:feedback@gidia.app" class="email-button email-button-secondary">
            Enviar feedback
        </a>
    </div>

    <div class="divider"></div>

    <div class="email-content">
        <p style="font-size: 14px; color: #6a6a6a;">
            <strong>Versión:</strong> {{ $update['version'] ?? '1.0.0' }} •
            <strong>Fecha:</strong> {{ $update['release_date'] ?? now()->format('d/m/Y') }}
        </p>
    </div>
@endsection
