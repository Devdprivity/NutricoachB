# 💳 Integración de Stripe - Guía Completa

## 📋 Resumen

Esta guía te ayudará a configurar los pagos reales con Stripe en NutiCoach.

---

## ✅ Lo que ya está implementado

1. ✅ **Paquete de Stripe** instalado (`stripe/stripe-php`)
2. ✅ **Servicio de Stripe** (`app/Services/StripeService.php`)
3. ✅ **Controlador de Webhooks** (`app/Http/Controllers/Web/StripeWebhookController.php`)
4. ✅ **Controlador de Suscripciones** actualizado con Stripe
5. ✅ **Migraciones** para campos de Stripe
6. ✅ **Rutas** configuradas
7. ✅ **Comando** para configurar productos en Stripe

---

## 🔧 Configuración Paso a Paso

### 1. Crear cuenta en Stripe

1. Ve a [https://stripe.com](https://stripe.com)
2. Crea una cuenta o inicia sesión
3. Ve al Dashboard de Stripe

### 2. Obtener las API Keys

1. En el Dashboard de Stripe, ve a **Developers** → **API keys**
2. Copia las siguientes claves:
   - **Publishable key** (empieza con `pk_test_...` o `pk_live_...`)
   - **Secret key** (empieza con `sk_test_...` o `sk_live_...`)

### 3. Configurar Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
# Stripe Configuration
STRIPE_KEY=pk_test_tu_publishable_key_aqui
STRIPE_SECRET=sk_test_tu_secret_key_aqui
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui
```

**Nota**: Usa las claves de **test** (`pk_test_` y `sk_test_`) para desarrollo, y las claves de **live** (`pk_live_` y `sk_live_`) para producción.

### 4. Ejecutar Migraciones

Ejecuta la migración para agregar los campos de Stripe a las tablas:

```bash
php artisan migrate
```

### 5. Configurar Productos en Stripe

Ejecuta el comando para crear los productos y precios en Stripe:

```bash
php artisan stripe:setup-products
```

Este comando:
- Crea productos en Stripe para cada plan (Basic, Premium)
- Crea precios mensuales y anuales
- Guarda los IDs de Stripe en la base de datos

### 6. Configurar Webhooks en Stripe

Los webhooks permiten que Stripe notifique a tu aplicación sobre eventos (pagos exitosos, cancelaciones, etc.).

#### Desarrollo Local (usando Stripe CLI)

1. Instala Stripe CLI:
   ```bash
   # Windows (con Scoop)
   scoop install stripe
   
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Linux
   # Descarga desde https://github.com/stripe/stripe-cli/releases
   ```

2. Autentícate:
   ```bash
   stripe login
   ```

3. Escucha webhooks localmente:
   ```bash
   stripe listen --forward-to http://localhost:8000/stripe/webhook
   ```

4. Copia el **webhook signing secret** que aparece (empieza con `whsec_...`) y agrégalo a tu `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui
   ```

#### Producción

1. En el Dashboard de Stripe, ve a **Developers** → **Webhooks**
2. Click en **Add endpoint**
3. URL del endpoint: `https://nutricoachb-main-2vd5yx.laravel.cloud/stripe/webhook`
4. Selecciona los siguientes eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click en **Add endpoint**
6. Copia el **Signing secret** y agrégalo a tu `.env` de producción

---

## 🚀 Cómo Funciona

### Flujo de Suscripción

1. **Usuario elige un plan** en `/subscription`
2. Click en **"Suscribirse"**
3. **Backend crea una sesión de Stripe Checkout**:
   - Crea o recupera el cliente de Stripe
   - Genera una sesión de checkout con el precio correspondiente
4. **Usuario es redirigido a Stripe Checkout** (página segura de Stripe)
5. **Usuario ingresa su tarjeta** y completa el pago
6. **Stripe procesa el pago** y redirige al usuario a `/subscription/success`
7. **Stripe envía un webhook** a `/stripe/webhook` con el evento `checkout.session.completed`
8. **Backend procesa el webhook**:
   - Crea la suscripción en la base de datos
   - Actualiza el usuario a premium
   - Crea el registro de pago
9. **Usuario ve su suscripción activa** en `/subscription`

### Webhooks Manejados

| Evento | Descripción | Acción |
|--------|-------------|--------|
| `checkout.session.completed` | Pago inicial completado | Crear suscripción, activar premium |
| `customer.subscription.updated` | Suscripción actualizada | Actualizar estado de suscripción |
| `customer.subscription.deleted` | Suscripción cancelada | Cancelar suscripción, volver a plan gratuito |
| `invoice.payment_succeeded` | Renovación exitosa | Crear registro de pago |
| `invoice.payment_failed` | Pago fallido | Marcar suscripción como `past_due` |

---

## 🧪 Pruebas

### Tarjetas de Prueba de Stripe

Usa estas tarjetas para probar en modo test:

| Número | Descripción |
|--------|-------------|
| `4242 4242 4242 4242` | Pago exitoso |
| `4000 0000 0000 0002` | Pago rechazado |
| `4000 0000 0000 9995` | Fondos insuficientes |

- **CVV**: Cualquier 3 dígitos
- **Fecha**: Cualquier fecha futura
- **ZIP**: Cualquier código postal

### Probar el Flujo Completo

1. Inicia sesión en tu aplicación
2. Ve a `/subscription`
3. Selecciona un plan de pago (Basic o Premium)
4. Click en **"Suscribirse"**
5. Serás redirigido a Stripe Checkout
6. Usa la tarjeta de prueba `4242 4242 4242 4242`
7. Completa el pago
8. Verifica que:
   - Fuiste redirigido a `/subscription` con mensaje de éxito
   - Tu plan actual es el que seleccionaste
   - Aparece tu suscripción activa

---

## 📊 Monitoreo

### Ver Pagos en Stripe

1. Ve al Dashboard de Stripe
2. **Payments** → Ver todos los pagos
3. **Customers** → Ver todos los clientes
4. **Subscriptions** → Ver todas las suscripciones

### Ver Logs en Laravel

```bash
tail -f storage/logs/laravel.log
```

Busca líneas como:
- `Stripe subscription created`
- `Stripe subscription updated`
- `Invoice payment succeeded`

---

## 🔒 Seguridad

1. **Nunca expongas tu Secret Key** en el frontend
2. **Verifica siempre la firma de los webhooks** (ya implementado)
3. **Usa HTTPS en producción** (obligatorio para Stripe)
4. **Guarda las Secret Keys en variables de entorno**, nunca en el código

---

## 💰 Precios Actuales

| Plan | Mensual | Anual | Ahorro Anual |
|------|---------|-------|--------------|
| Free | $0 | $0 | - |
| Basic | $9.99 | $99.00 | 17% |
| Premium | $19.99 | $199.00 | 17% |

---

## 🛠️ Comandos Útiles

```bash
# Configurar productos en Stripe
php artisan stripe:setup-products

# Ejecutar migraciones
php artisan migrate

# Ver logs en tiempo real
php artisan pail

# Escuchar webhooks localmente
stripe listen --forward-to http://localhost:8000/stripe/webhook

# Probar un webhook manualmente
stripe trigger checkout.session.completed
```

---

## 📝 Checklist de Implementación

### Desarrollo

- [ ] Crear cuenta en Stripe
- [ ] Obtener API keys de test
- [ ] Agregar variables de entorno
- [ ] Ejecutar migraciones
- [ ] Ejecutar `php artisan stripe:setup-products`
- [ ] Instalar Stripe CLI
- [ ] Configurar webhook local
- [ ] Probar flujo completo con tarjeta de prueba

### Producción

- [ ] Cambiar a API keys de producción (live)
- [ ] Configurar webhook en Dashboard de Stripe
- [ ] Agregar `STRIPE_WEBHOOK_SECRET` de producción
- [ ] Ejecutar migraciones en producción
- [ ] Ejecutar `php artisan stripe:setup-products` en producción
- [ ] Probar con tarjeta de prueba
- [ ] Verificar que los webhooks se reciben correctamente
- [ ] Monitorear logs de Stripe y Laravel

---

## ❓ Preguntas Frecuentes

### ¿Puedo usar el plan gratuito sin Stripe?

Sí, el plan gratuito no requiere Stripe y funciona sin configuración adicional.

### ¿Qué pasa si un usuario cancela su suscripción?

La suscripción se marca como cancelada y el usuario vuelve automáticamente al plan gratuito al final del período de facturación.

### ¿Cómo manejo reembolsos?

Los reembolsos se manejan directamente desde el Dashboard de Stripe. El webhook `charge.refunded` actualizará automáticamente el estado en tu base de datos.

### ¿Puedo cambiar los precios?

Sí, pero debes crear nuevos precios en Stripe y actualizar los `stripe_price_id` en la base de datos. Los clientes existentes mantendrán sus precios antiguos.

---

## 🆘 Soporte

- **Documentación de Stripe**: [https://stripe.com/docs](https://stripe.com/docs)
- **Dashboard de Stripe**: [https://dashboard.stripe.com](https://dashboard.stripe.com)
- **Stripe CLI**: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

---

## ✅ ¡Listo!

Una vez completada la configuración, tu aplicación estará lista para aceptar pagos reales con Stripe. 🎉

