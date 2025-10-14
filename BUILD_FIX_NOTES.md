# Build Fix Notes - NutriCoach

## 🔴 Problema Identificado

El build falla en sistemas case-sensitive (Linux) debido a inconsistencias en los nombres de archivos de los componentes landing.

## ✅ Solución Aplicada

### Archivos Renombrados (con capitalización correcta):
- ✅ `Benefits.tsx` (correcto)
- ✅ `Features.tsx` (correcto - fue `features.tsx`)
- ✅ `Footer.tsx` (correcto - fue `footer.tsx`)
- ✅ `Header.tsx` (correcto - fue `header.tsx`)
- ✅ `Hero.tsx` (correcto - fue `hero.tsx`)
- ✅ `Philosophy.tsx` (correcto)
- ✅ `ScrollVideo.tsx` (correcto)
- ✅ `UserProfile.tsx` (correcto)

### Archivo index.tsx actualizado:
`resources/js/components/landing/index.tsx` ahora usa imports con extensiones explícitas:

```tsx
// Landing page components exports
export { Header } from './Header.tsx';
export { Hero } from './Hero.tsx';
export { Benefits } from './Benefits.tsx';
export { Features } from './Features.tsx';
export { Philosophy } from './Philosophy.tsx';
export { UserProfile } from './UserProfile.tsx';
export { ScrollVideo } from './ScrollVideo.tsx';
```

## 🚀 Para Deploy en Producción

### Antes de hacer push/deploy:

1. **Verificar que todos los archivos estén en git:**
   ```bash
   git status
   git add resources/js/components/landing/
   git commit -m "fix: update landing component file names for case-sensitive systems"
   ```

2. **Asegurar que los archivos renombrados se eliminen del historial:**
   ```bash
   git rm --cached resources/js/components/landing/features.tsx 2>/dev/null || true
   git rm --cached resources/js/components/landing/header.tsx 2>/dev/null || true
   git rm --cached resources/js/components/landing/hero.tsx 2>/dev/null || true
   git rm --cached resources/js/components/landing/footer.tsx 2>/dev/null || true
   ```

3. **Agregar los archivos con nombres correctos:**
   ```bash
   git add resources/js/components/landing/Features.tsx
   git add resources/js/components/landing/Header.tsx
   git add resources/js/components/landing/Hero.tsx
   git add resources/js/components/landing/Footer.tsx
   git add resources/js/components/landing/index.tsx
   git commit -m "fix: correct file capitalization for landing components"
   ```

### En el servidor de producción (después del deploy):

1. **Limpiar caché de node_modules:**
   ```bash
   rm -rf node_modules/.vite
   ```

2. **Reinstalar dependencias (si es necesario):**
   ```bash
   npm ci
   ```

3. **Ejecutar build:**
   ```bash
   npm run build
   ```

## 🧪 Verificación Local

Para verificar que el build funciona antes de hacer deploy:

```bash
# Limpiar caché
rm -rf node_modules/.vite

# Build
npm run build
```

El build debe completarse exitosamente en ~5-6 segundos.

## 📝 Notas Importantes

1. **Windows vs Linux:** Windows no distingue entre mayúsculas/minúsculas en nombres de archivos, pero Linux sí. Por eso el build funciona localmente en Windows pero falla en servidores Linux.

2. **Git y case sensitivity:** Git en Windows por defecto no detecta cambios solo de capitalización. Usa los comandos de arriba para forzar el cambio.

3. **Extensiones explícitas:** Agregamos `.tsx` a los imports para mayor claridad y robustez.

## ✅ Build Exitoso

Después de aplicar estos cambios, el build debe mostrar:

```
✓ built in 5.59s
```

Con 31 archivos generados correctamente en `public/build/`.
