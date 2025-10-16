# Solución al Error "Unmatched Route" después del Login

## Problema

Después de autenticarse con Google, el backend redirige correctamente a la app, pero aparece el error:
```
unmatched route page could not be found
```

## Causa

El backend está redirigiendo a `exp://192.168.1.6:8081/--/auth/callback?token=...&user=...`, pero la app no tiene una ruta física en `app/auth/callback.tsx`. En su lugar, usamos **deep linking** para capturar la URL y procesar el token.

## Solución Implementada

### 1. Deep Link Listener en `auth-provider.tsx`

Agregamos un listener de deep links que:
- Escucha cuando la app recibe una URL (como `exp://...auth/callback`)
- Extrae el `token` y los datos del `user` de los parámetros
- Guarda el token en AsyncStorage
- Marca al usuario como autenticado
- Redirige automáticamente al home `/(tabs)`

```typescript
// En components/auth-provider.tsx (líneas 52-104)
useEffect(() => {
  const handleDeepLink = async (event: { url: string }) => {
    const url = event.url;
    console.log('Deep link received:', url);

    if (url.includes('auth/callback')) {
      try {
        const parsedUrl = Linking.parse(url);
        const token = parsedUrl.queryParams?.token as string;
        const userDataParam = parsedUrl.queryParams?.user as string;

        if (token) {
          await AsyncStorage.setItem('auth_token', token);

          if (userDataParam) {
            const userData = JSON.parse(decodeURIComponent(userDataParam));
            await AsyncStorage.setItem('user_data', JSON.stringify(userData));
            setUser(userData);
          }

          setIsAuthenticated(true);
          router.replace('/(tabs)'); // Redirige al home
        }
      } catch (error) {
        console.error('Error processing deep link:', error);
      }
    }
  };

  // Escuchar deep links
  const subscription = Linking.addEventListener('url', handleDeepLink);
  return () => subscription.remove();
}, []);
```

### 2. No se necesita crear `app/auth/callback.tsx`

El deep link se maneja completamente en el `AuthProvider`, no necesitamos crear una ruta física.

## Cómo funciona ahora

1. **Usuario presiona "Continuar con Google"**
   - Se abre el navegador con la URL del backend

2. **Backend procesa el login**
   - Google autentica al usuario
   - Backend genera un token
   - Backend redirige a: `exp://192.168.1.6:8081/--/auth/callback?token=...&user=...`

3. **App recibe el deep link**
   - El listener en `AuthProvider` detecta la URL
   - Extrae el token y datos del usuario
   - Guarda en AsyncStorage
   - **Automáticamente redirige al home**: `router.replace('/(tabs)')`

4. **Usuario ve el home autenticado**
   - La app muestra el dashboard principal
   - El usuario ya está logueado

## Logs para verificar que funciona

Cuando el proceso funcione correctamente, verás en la consola:

```
Deep link received: exp://192.168.1.6:8081/--/auth/callback?token=1|xxx&user=%7B...%7D
Token from deep link: Yes
User data from deep link: Yes
```

Seguido de la navegación al home.

## Si sigue sin funcionar

### Verifica en los logs de React Native:

1. **¿Llega el deep link?**
   ```
   Deep link received: exp://...
   ```

2. **¿Se extrae el token?**
   ```
   Token from deep link: Yes
   ```

3. **¿Se extrae el usuario?**
   ```
   User data from deep link: Yes
   ```

### Si no ves estos logs:

- **Problema**: La app no está recibiendo el deep link
- **Solución**: Verifica que el backend esté redirigiendo exactamente al `redirect_uri` que recibió

### Si ves los logs pero no redirige:

- **Problema**: Error al guardar en AsyncStorage o al navegar
- **Solución**: Revisa los logs completos para ver el error específico

## Esquemas de URL soportados

La app soporta ambos esquemas:

**Desarrollo (Expo Go)**:
```
exp://192.168.1.6:8081/--/auth/callback
exp://localhost:8081/--/auth/callback
```

**Producción (app compilada)**:
```
nutricoach://auth/callback
```

El listener funciona con cualquiera de estos esquemas porque solo verifica que la URL contenga `auth/callback`.

## Resumen

✅ NO necesitas crear una ruta física `app/auth/callback.tsx`
✅ El deep link se maneja automáticamente en `AuthProvider`
✅ Después del login, el usuario va directamente al home `/(tabs)`
✅ El error "unmatched route" no debería aparecer más porque interceptamos el deep link antes

Si todavía ves el error, comparte los logs completos de la consola para diagnosticar mejor.
