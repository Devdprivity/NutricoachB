<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Mail\AccountDeletedMail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        // Guardar datos necesarios ANTES de eliminar el usuario
        $userEmail = $user->email;
        $userName = $user->name;
        $deletionDate = now()->format('Y-m-d H:i:s');

        // Enviar email de confirmación ANTES de eliminar la cuenta
        try {
            Mail::to($userEmail)->send(new AccountDeletedMail($user));
            \Log::info('AccountDeletedMail sent', [
                'user_id' => $user->id,
                'email' => $userEmail,
                'deletion_date' => $deletionDate
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send AccountDeletedMail: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'email' => $userEmail,
            ]);
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
