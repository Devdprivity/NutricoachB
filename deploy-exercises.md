# Instrucciones para subir ejercicios al servidor

## Problema
Los archivos de ejercicios (`storage/app/public/exercises/`) no se subieron a GitHub porque están en `storage/` que puede estar ignorado o no se incluyeron en el commit.

## Solución 1: Ejecutar comando en el servidor (Recomendado)

Si tienes acceso SSH al servidor, ejecuta:

```bash
php artisan exercises:download-gifs --total=500
```

Esto descargará todos los ejercicios y GIFs directamente en el servidor.

## Solución 2: Subir archivos manualmente

1. **Empaquetar archivos localmente:**
   ```bash
   # En tu máquina local
   cd storage/app/public
   tar -czf exercises.tar.gz exercises/
   ```

2. **Subir al servidor:**
   - Usa SCP, SFTP o el panel de Laravel Cloud
   - Sube `exercises.tar.gz` a `/var/www/html/storage/app/public/`
   
3. **Descomprimir en el servidor:**
   ```bash
   cd /var/www/html/storage/app/public
   tar -xzf exercises.tar.gz
   chmod -R 755 exercises/
   ```

4. **Verificar:**
   ```bash
   php artisan exercises:check-status
   ```

## Solución 3: Agregar al repositorio (si quieres versionar)

Si quieres que los archivos estén en Git:

1. **Verificar .gitignore:**
   Asegúrate de que `storage/app/public/exercises/` NO esté en `.gitignore`

2. **Agregar al repositorio:**
   ```bash
   git add storage/app/public/exercises/
   git commit -m "Add exercise GIFs and metadata"
   git push
   ```

3. **En el servidor, hacer pull:**
   ```bash
   git pull
   ```

## Verificar estado

Después de cualquier método, verifica:

```bash
php artisan exercises:check-status
```

