<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class CloudinaryService
{
    protected Cloudinary $cloudinary;

    public function __construct()
    {
        // Inicializar Cloudinary directamente con las variables de entorno
        $this->cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => config('cloudinary.cloud_name') ?: env('CLOUDINARY_CLOUD_NAME'),
                'api_key' => config('cloudinary.api_key') ?: env('CLOUDINARY_API_KEY'),
                'api_secret' => config('cloudinary.api_secret') ?: env('CLOUDINARY_API_SECRET'),
            ],
            'url' => [
                'secure' => config('cloudinary.secure', true),
            ],
        ]);
    }
    /**
     * Subir imagen de nutrición a Cloudinary
     * 
     * @param UploadedFile $file
     * @param int $userId
     * @param string|null $date Fecha en formato Y-m-d
     * @return array ['url' => string, 'public_id' => string, 'secure_url' => string]
     */
    public function uploadNutritionImage(UploadedFile $file, int $userId, ?string $date = null): array
    {
        $date = $date ?? now()->format('Y-m-d');
        $uuid = Str::uuid()->toString();
        $timestamp = now()->format('YmdHis');
        
        // Estructura: usuarios/{user_id}/nutrition/{date}/{timestamp}_{uuid}.{ext}
        $folder = "usuarios/{$userId}/nutrition/{$date}";
        $filename = "{$timestamp}_{$uuid}";
        
        try {
            // Usar uploadApi() para acceder al método upload correctamente
            $result = $this->cloudinary->uploadApi()->upload($file->getRealPath(), [
                'folder' => $folder,
                'public_id' => $filename,
                'resource_type' => 'image',
                'overwrite' => false,
                'unique_filename' => false, // Ya tenemos UUID único
            ]);

            // El resultado de Cloudinary SDK es un objeto ApiResponse que extiende ArrayObject
            // Podemos acceder a los datos como si fuera un array o convertir a array
            $resultArray = $result instanceof \ArrayObject ? $result->getArrayCopy() : (array)$result;

            // Extraer los valores del array de respuesta
            $secureUrl = $resultArray['secure_url'] ?? $resultArray['url'] ?? null;
            $publicId = $resultArray['public_id'] ?? null;
            
            if (!$secureUrl) {
                \Log::error('Cloudinary upload result missing secure_url', [
                    'result_keys' => array_keys($resultArray),
                    'result_sample' => array_slice($resultArray, 0, 5, true),
                ]);
                throw new \Exception('Cloudinary upload result missing secure_url. Result keys: ' . implode(', ', array_keys($resultArray)));
            }
            
            if (!$publicId) {
                \Log::error('Cloudinary upload result missing public_id', [
                    'result_keys' => array_keys($resultArray),
                    'result_sample' => array_slice($resultArray, 0, 5, true),
                ]);
                throw new \Exception('Cloudinary upload result missing public_id. Result keys: ' . implode(', ', array_keys($resultArray)));
            }
            
            return [
                'url' => $secureUrl,
                'public_id' => $publicId,
                'secure_url' => $secureUrl,
                'cloudinary_url' => $secureUrl,
            ];
        } catch (\Exception $e) {
            \Log::error('Cloudinary upload error: ' . $e->getMessage(), [
                'file' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'file_mime' => $file->getMimeType(),
                'user_id' => $userId,
                'date' => $date,
                'folder' => $folder,
                'filename' => $filename,
                'error' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Eliminar imagen de Cloudinary
     * 
     * @param string $publicId
     * @return bool
     */
    public function deleteImage(string $publicId): bool
    {
        try {
            $this->cloudinary->uploadApi()->destroy($publicId, [
                'resource_type' => 'image',
            ]);
            return true;
        } catch (\Exception $e) {
            \Log::error('Error deleting image from Cloudinary: ' . $e->getMessage(), [
                'public_id' => $publicId,
                'error' => $e->getTraceAsString(),
            ]);
            return false;
        }
    }

    /**
     * Subir avatar de usuario a Cloudinary
     * 
     * @param UploadedFile $file
     * @param int $userId
     * @return array ['url' => string, 'public_id' => string, 'secure_url' => string]
     */
    public function uploadAvatar(UploadedFile $file, int $userId): array
    {
        $uuid = Str::uuid()->toString();
        $timestamp = now()->format('YmdHis');
        
        // Estructura: usuarios/{user_id}/avatars/{timestamp}_{uuid}.{ext}
        $folder = "usuarios/{$userId}/avatars";
        $filename = "{$timestamp}_{$uuid}";
        
        try {
            $result = $this->cloudinary->uploadApi()->upload($file->getRealPath(), [
                'folder' => $folder,
                'public_id' => $filename,
                'resource_type' => 'image',
                'overwrite' => false,
                'unique_filename' => false,
                'transformation' => [
                    'width' => 400,
                    'height' => 400,
                    'crop' => 'fill',
                    'gravity' => 'face',
                    'quality' => 'auto',
                    'fetch_format' => 'auto',
                ],
            ]);

            $resultArray = $result instanceof \ArrayObject ? $result->getArrayCopy() : (array)$result;

            $secureUrl = $resultArray['secure_url'] ?? $resultArray['url'] ?? null;
            $publicId = $resultArray['public_id'] ?? null;
            
            if (!$secureUrl || !$publicId) {
                throw new \Exception('Cloudinary upload result missing required fields');
            }
            
            return [
                'url' => $secureUrl,
                'public_id' => $publicId,
                'secure_url' => $secureUrl,
                'cloudinary_url' => $secureUrl,
            ];
        } catch (\Exception $e) {
            \Log::error('Cloudinary avatar upload error: ' . $e->getMessage(), [
                'file' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'file_mime' => $file->getMimeType(),
                'user_id' => $userId,
                'error' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Obtener URL de imagen optimizada
     * 
     * @param string $publicId
     * @param array $transformations Transformaciones opcionales
     * @return string
     */
    public function getOptimizedUrl(string $publicId, array $transformations = []): string
    {
        $defaultTransformations = [
            'quality' => 'auto',
            'fetch_format' => 'auto',
        ];

        $transformations = array_merge($defaultTransformations, $transformations);

        return $this->cloudinary->image($publicId)->toUrl($transformations);
    }
}

