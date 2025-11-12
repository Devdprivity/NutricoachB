# Plan Completo de Vistas - NutriCoach

## Vistas a Crear

### ✅ 1. Dashboard (COMPLETADO)
- Resumen general del día
- Cards con IMC, peso, BMR, TDEE
- Tracking de hidratación y nutrición del día
- Accesos rápidos

### 🔄 2. Hidratación (/hydration)
- Registro rápido de agua
- Lista de registros del día
- Progress bar de meta diaria
- Gráfico semanal
- Tipos de bebidas
- Resumen semanal

### 🔄 3. Nutrición (/nutrition)
- Registro de comidas por tipo (desayuno, almuerzo, cena, snack)
- Búsqueda de alimentos
- Tracking de calorías y macros
- Progress bars de proteínas, carbos, grasas
- Sistema de semáforo (verde/amarillo/rojo)
- Historial de comidas

### 🔄 4. Ejercicios (/exercises)
- Lista de ejercicios recomendados según perfil
- Registro de ejercicios realizados
- Tracking de calorías quemadas
- Historial de entrenamientos
- Filtros por tipo de ejercicio

### 🔄 5. Coaching (/coaching)
- Mensajes del coach
- Consejos personalizados
- Estrategias para días difíciles
- Manejo de antojos
- Tips para situaciones sociales
- Historial de mensajes

### 🔄 6. Progreso (/progress)
- Gráfico de peso a lo largo del tiempo
- Proyección para alcanzar meta
- Gráficos de adherencia nutricional
- Estadísticas semanales/mensuales
- Comparación de macros
- Tendencias

### 🔄 7. Contexto (/context)
- Registro de días especiales
- Niveles de estrés
- Estado emocional
- Factores que afectan la nutrición
- Historial de contextos

## Navegación (Sidebar)

```
Dashboard
├── Hidratación
├── Nutrición
├── Ejercicios
├── Coaching
├── Progreso
└── Contexto

Settings
├── Profile
├── Nutritional Profile
├── Password
├── Two-Factor Auth
└── Appearance
```

## Controladores Backend Necesarios

- DashboardController (para datos del dashboard)
- HydrationWebController (interfaz web para hidratación)
- NutritionWebController (interfaz web para nutrición)
- ExercisesWebController (interfaz web para ejercicios)
- CoachingWebController (interfaz web para coaching)
- ProgressWebController (interfaz web para progreso)
- ContextWebController (interfaz web para contexto)

## Rutas Web Necesarias

```php
// Dashboard
GET /dashboard

// Hidratación
GET /hydration
POST /hydration (crear registro)
DELETE /hydration/{id} (eliminar registro)

// Nutrición
GET /nutrition
POST /nutrition (crear registro)
DELETE /nutrition/{id} (eliminar registro)

// Ejercicios
GET /exercises
POST /exercises/log (registrar ejercicio)

// Coaching
GET /coaching
POST /coaching/difficult-day
POST /coaching/craving-sos

// Progreso
GET /progress

// Contexto
GET /context
POST /context (crear contexto)
```
