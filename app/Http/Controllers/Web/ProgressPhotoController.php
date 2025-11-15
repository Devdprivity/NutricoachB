<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\ProgressPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProgressPhotoController extends Controller
{
    /**
     * Subir una nueva foto de progreso
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'image' => 'required|image|max:10240', // 10MB max
            'date' => 'required|date',
            'weight' => 'nullable|numeric|min:0|max:500',
            'body_fat_percentage' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string|max:500',
            'is_baseline' => 'nullable|boolean',
            'visibility' => 'nullable|in:private,public',

            // Medidas corporales opcionales
            'measurements.chest' => 'nullable|numeric|min:0',
            'measurements.waist' => 'nullable|numeric|min:0',
            'measurements.hips' => 'nullable|numeric|min:0',
            'measurements.bicep_left' => 'nullable|numeric|min:0',
            'measurements.bicep_right' => 'nullable|numeric|min:0',
            'measurements.thigh_left' => 'nullable|numeric|min:0',
            'measurements.thigh_right' => 'nullable|numeric|min:0',
            'measurements.calf_left' => 'nullable|numeric|min:0',
            'measurements.calf_right' => 'nullable|numeric|min:0',
        ]);

        $user = $request->user();

        // Subir imagen
        $imagePath = $request->file('image')->store('progress_photos', 'public');

        // Si es baseline, quitar ese flag de otras fotos
        if ($validated['is_baseline'] ?? false) {
            ProgressPhoto::where('user_id', $user->id)
                ->where('is_baseline', true)
                ->update(['is_baseline' => false]);
        }

        // Crear foto de progreso
        ProgressPhoto::create([
            'user_id' => $user->id,
            'date' => $validated['date'],
            'image_path' => $imagePath,
            'weight' => $validated['weight'] ?? null,
            'body_fat_percentage' => $validated['body_fat_percentage'] ?? null,
            'measurements' => $validated['measurements'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'is_baseline' => $validated['is_baseline'] ?? false,
            'visibility' => $validated['visibility'] ?? 'private',
        ]);

        return redirect()->route('progress');
    }

    /**
     * Eliminar foto de progreso
     */
    public function destroy(Request $request, $id)
    {
        $photo = ProgressPhoto::where('user_id', $request->user()->id)
            ->findOrFail($id);

        // Eliminar imagen del storage
        if ($photo->image_path) {
            Storage::disk('public')->delete($photo->image_path);
        }

        $photo->delete();

        return redirect()->route('progress');
    }

    /**
     * Marcar una foto como baseline
     */
    public function setBaseline(Request $request, $id)
    {
        $user = $request->user();

        // Quitar baseline de todas las fotos
        ProgressPhoto::where('user_id', $user->id)
            ->where('is_baseline', true)
            ->update(['is_baseline' => false]);

        // Marcar la foto seleccionada como baseline
        $photo = ProgressPhoto::where('user_id', $user->id)
            ->findOrFail($id);

        $photo->is_baseline = true;
        $photo->save();

        return redirect()->route('progress');
    }

    /**
     * Actualizar notas de una foto
     */
    public function updateNotes(Request $request, $id)
    {
        $validated = $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        $photo = ProgressPhoto::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $photo->notes = $validated['notes'];
        $photo->save();

        return redirect()->route('progress');
    }
}
