@extends('emails.layout')

@section('content')
    <h1 class="email-title">Tienes un nuevo seguidor</h1>

    <div class="email-content">
        <p>Hola {{ $user->name }},</p>

        <p><strong>{{ $follower->name }}</strong> ha comenzado a seguirte en NutriCoach.</p>
    </div>

    <div class="info-box">
        <div style="display: table; width: 100%;">
            <div style="display: table-cell; width: 80px; vertical-align: top;">
                @if($follower->avatar)
                <img src="{{ $follower->avatar }}" alt="{{ $follower->name }}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">
                @else
                <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #22c55e; color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 600;">
                    {{ strtoupper(substr($follower->name, 0, 1)) }}
                </div>
                @endif
            </div>
            <div style="display: table-cell; vertical-align: middle; padding-left: 15px;">
                <div style="font-weight: 600; font-size: 18px; color: #1a1a1a; margin-bottom: 5px;">
                    {{ $follower->name }}
                </div>
                @if(isset($follower->profile->bio))
                <div style="color: #6a6a6a; font-size: 14px;">
                    {{ Str::limit($follower->profile->bio, 100) }}
                </div>
                @endif
            </div>
        </div>
    </div>

    @if(isset($follower->stats))
    <div class="stats-container">
        @if(isset($follower->stats['followers_count']))
        <div class="stat-item">
            <span class="stat-number">{{ $follower->stats['followers_count'] }}</span>
            <span class="stat-label">Seguidores</span>
        </div>
        @endif
        @if(isset($follower->stats['following_count']))
        <div class="stat-item">
            <span class="stat-number">{{ $follower->stats['following_count'] }}</span>
            <span class="stat-label">Siguiendo</span>
        </div>
        @endif
        @if(isset($follower->stats['activities_count']))
        <div class="stat-item">
            <span class="stat-number">{{ $follower->stats['activities_count'] }}</span>
            <span class="stat-label">Actividades</span>
        </div>
        @endif
    </div>
    @endif

    <div class="email-content">
        <p>Conecta con {{ $follower->name }} y compartan sus experiencias en el camino hacia una vida más saludable.</p>
    </div>

    <div style="text-align: center;">
        <a href="{{ config('app.url') }}/profile/{{ $follower->id }}" class="email-button">
            Ver perfil
        </a>
        <a href="{{ config('app.url') }}/profile/{{ $follower->id }}/follow" class="email-button email-button-secondary" style="margin-left: 10px;">
            Seguir también
        </a>
    </div>

    <div class="divider"></div>

    <div class="email-content">
        <p style="font-size: 14px; color: #6a6a6a;">
            Puedes gestionar tus preferencias de notificaciones en
            <a href="{{ config('app.url') }}/settings/notifications" style="color: #22c55e;">Configuración</a>
        </p>
    </div>
@endsection
