# Script para agregar ejercicios al repositorio Git (PowerShell)

Write-Host "📦 Agregando ejercicios al repositorio Git..." -ForegroundColor Cyan

# Verificar que existe la carpeta
if (-not (Test-Path "storage\app\public\exercises")) {
    Write-Host "❌ No se encontró la carpeta storage\app\public\exercises" -ForegroundColor Red
    Write-Host "   Ejecuta primero: php artisan exercises:download-gifs" -ForegroundColor Yellow
    exit 1
}

# Verificar que existe metadata.json
if (-not (Test-Path "storage\app\public\exercises\metadata.json")) {
    Write-Host "❌ No se encontró metadata.json" -ForegroundColor Red
    Write-Host "   Ejecuta primero: php artisan exercises:download-gifs" -ForegroundColor Yellow
    exit 1
}

# Contar archivos
$gifFiles = Get-ChildItem -Path "storage\app\public\exercises" -Filter "*.gif" -Recurse -ErrorAction SilentlyContinue
$gifCount = $gifFiles.Count

Write-Host "📊 Encontrados:" -ForegroundColor Green
Write-Host "   - $gifCount archivos GIF"
Write-Host "   - 1 archivo metadata.json"
Write-Host ""

# Agregar al repositorio
Write-Host "➕ Agregando archivos a Git..." -ForegroundColor Cyan
git add storage/app/public/exercises/

# Mostrar estado
Write-Host ""
Write-Host "✅ Archivos agregados. Estado:" -ForegroundColor Green
git status --short storage/app/public/exercises/ | Select-Object -First 10

Write-Host ""
Write-Host "📝 Para completar, ejecuta:" -ForegroundColor Yellow
Write-Host "   git commit -m 'Add exercise GIFs and metadata'"
Write-Host "   git push"

