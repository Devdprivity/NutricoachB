<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IntegrationsController extends Controller
{
    /**
     * Show the integrations settings page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        $integrations = [
            'spotify' => [
                'connected' => !empty($user->spotify_id),
                'spotify_id' => $user->spotify_id,
                'share_listening' => $user->spotify_share_listening ?? false,
            ],
        ];

        return Inertia::render('settings/integrations', [
            'integrations' => $integrations,
        ]);
    }
}

