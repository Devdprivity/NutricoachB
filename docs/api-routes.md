### Rutas de API para la app (base URL)

Base URL de producción: `https://nutricoachb-main-2vd5yx.laravel.cloud/api`

Nota: Todas las rutas (salvo observaciones) requieren autenticación con Bearer Token (Sanctum).

Referencia: [`https://nutricoachb-main-2vd5yx.laravel.cloud/`](https://nutricoachb-main-2vd5yx.laravel.cloud/)

---

### Autenticación y usuario
- GET `/user` — Obtiene el usuario autenticado.
- POST `/logout` — Cierra sesión (revoca el token actual).

---

### Perfil (`/profile`)
- GET `/profile/` — Ver perfil.
- POST `/profile/` — Crear/guardar perfil.
- PUT `/profile/` — Actualizar perfil.

---

### Datos nutricionales (`/nutrition`)
- GET `/nutrition/` — Listar registros.
- POST `/nutrition/` — Crear registro.
- GET `/nutrition/daily-summary` — Resumen diario.
- GET `/nutrition/weekly-summary` — Resumen semanal.
- GET `/nutrition/{nutritionalData}` — Ver detalle por ID.
- PUT `/nutrition/{nutritionalData}` — Actualizar por ID.
- DELETE `/nutrition/{nutritionalData}` — Eliminar por ID.

---

### Alimentos (`/foods`)
- GET `/foods/` — Listar alimentos (con filtros).
- GET `/foods/categories` — Listar categorías.
- GET `/foods/tags` — Tags populares.
- GET `/foods/{foodItem}` — Detalle de alimento por ID.
- POST `/foods/{foodItem}/calculate` — Calcular info nutricional del alimento.

---

### Hidratación (`/hydration`)
- GET `/hydration/` — Listar registros.
- POST `/hydration/` — Crear registro.
- GET `/hydration/daily-summary` — Resumen diario.
- GET `/hydration/weekly-summary` — Resumen semanal.
- GET `/hydration/drink-types` — Tipos de bebidas.
- PUT `/hydration/{hydrationRecord}` — Actualizar por ID.
- DELETE `/hydration/{hydrationRecord}` — Eliminar por ID.

---

### Coaching (`/coaching`)
- GET `/coaching/messages` — Mensajes de coaching.
- POST `/coaching/messages/{coachingMessage}/read` — Marcar mensaje como leído.
- POST `/coaching/daily-summary` — Resumen diario.
- POST `/coaching/progress-check` — Chequeo de progreso.
- POST `/coaching/difficult-day` — Soporte día difícil.
- POST `/coaching/craving-sos` — Craving SOS.
- POST `/coaching/social-situation` — Situación social.

---

### Chat IA Gemini (`/chat`)
- POST `/chat/send` — Enviar mensaje.
- GET `/chat/conversations` — Historial de conversaciones.
- GET `/chat/session/{sessionId}` — Conversación por sesión.
- POST `/chat/conversations/{conversation}/read` — Marcar conversación como leída.
- GET `/chat/stats` — Estadísticas de conversación.
- GET `/chat/suggestions` — Sugerencias de seguimiento.
- POST `/chat/session` — Crear nueva sesión.
- GET `/chat/context` — Contexto del usuario.
- GET `/chat/recent-context` — Contexto reciente.

---

### Alertas y seguridad (`/alerts`)
- GET `/alerts/` — Listar alertas del usuario.
- POST `/alerts/check` — Verificar y generar alertas.
- POST `/alerts/{userAlert}/dismiss` — Descartar alerta.
- GET `/alerts/medical-disclaimer` — Obtener aviso médico.
- POST `/alerts/medical-disclaimer/accept` — Aceptar aviso médico.

---

### Contexto del usuario (`/context`)
- GET `/context/` — Listar contextos.
- POST `/context/` — Crear contexto.
- GET `/context/tolerance` — Tolerancia ajustada.
- GET `/context/adherence` — Evaluar adherencia.
- GET `/context/recommendations` — Recomendaciones contextuales.
- PUT `/context/{userContext}` — Actualizar por ID.
- DELETE `/context/{userContext}` — Eliminar por ID.

---

### Planes de comida (`/meal-plans`)
- GET `/meal-plans/` — Listar planes.
- POST `/meal-plans/` — Crear plan.
- POST `/meal-plans/generate` — Generar plan automático.
- GET `/meal-plans/daily-summary` — Resumen diario del plan.
- GET `/meal-plans/weekly-progress` — Progreso semanal.
- POST `/meal-plans/{mealPlan}/complete` — Marcar como completado.
- PUT `/meal-plans/{mealPlan}` — Actualizar por ID.
- DELETE `/meal-plans/{mealPlan}` — Eliminar por ID.

---

### Ejercicios (`/exercises`)
- GET `/exercises/recommendations` — Recomendaciones por calorías y músculos descansados.
- GET `/exercises/` — Listar ejercicios (con filtros).
- GET `/exercises/muscle-status` — Estado de músculos (fatigados/descansados).
- POST `/exercises/log` — Registrar ejercicio completado.
- GET `/exercises/history` — Historial del usuario.
- GET `/exercises/summary` — Resumen diario de ejercicios.
- POST `/exercises/sync` — Sincronizar desde API externa.
- GET `/exercises/types` — Catálogo de tipos.
- GET `/exercises/muscles` — Catálogo de músculos.
- GET `/exercises/difficulties` — Catálogo de dificultades.
- GET `/exercises/{exercise}` — Detalle por ID.

---

### Administración (`/admin`, requiere middleware `admin`)
- REST `/admin/foods` — CRUD de alimentos (resource).

---

Autenticación: usar header `Authorization: Bearer {token}`. El prefijo `/api` es aplicado por Laravel (RouteServiceProvider) a todas estas rutas.

Referencia del entorno: [`https://nutricoachb-main-2vd5yx.laravel.cloud/`](https://nutricoachb-main-2vd5yx.laravel.cloud/)

