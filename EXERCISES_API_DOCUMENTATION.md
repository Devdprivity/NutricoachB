# API de Ejercicios - Documentación Completa

## Descripción General

El sistema de ejercicios permite a los usuarios obtener recomendaciones personalizadas de ejercicios basadas en:
- Calorías que desean quemar
- Grupos musculares que están descansados (evita fatiga muscular)
- Nivel de dificultad preferido
- Tipo de ejercicio deseado

## Configuración

### 1. Variable de Entorno

Agrega en tu archivo `.env` o en Laravel Cloud:

```env
API_NINJAS_KEY=tu_api_key_aqui
```

Para obtener una API Key gratis:
1. Visita: https://api-ninjas.com/
2. Crea una cuenta
3. Obtén tu API Key desde el dashboard

### 2. Sincronizar Ejercicios

Antes de usar el sistema, debes sincronizar ejercicios desde la API:

```bash
POST /api/exercises/sync
Authorization: Bearer {token}
```

Esto descargará y cacheará ejercicios en tu base de datos local.

## Endpoints Disponibles

### 1. Obtener Recomendaciones de Ejercicios

**Endpoint principal** - Recomienda ejercicios basados en calorías y músculos descansados.

```
GET /api/exercises/recommendations
```

**Headers:**
```
Authorization: Bearer {token}
```

**Parámetros Query:**
- `calories_to_burn` (required): Calorías que desea quemar (50-2000)
- `difficulty` (optional): beginner | intermediate | expert
- `type` (optional): cardio | strength | olympic_weightlifting | plyometrics | powerlifting | stretching | strongman

**Ejemplo de Request:**
```bash
GET /api/exercises/recommendations?calories_to_burn=300&difficulty=beginner&type=cardio
```

**Respuesta:**
```json
{
  "calories_to_burn": 300,
  "rested_muscles": [
    "chest",
    "biceps",
    "quadriceps"
  ],
  "recommended_exercises": [
    {
      "id": 1,
      "name": "Running",
      "type": "cardio",
      "muscle": "quadriceps",
      "equipment": "none",
      "difficulty": "beginner",
      "instructions": "Start running at a moderate pace...",
      "image_url": null,
      "calories_per_minute": 10,
      "recommended_duration_minutes": 30,
      "estimated_calories_burned": 300,
      "muscle_is_rested": true
    }
  ],
  "total_exercises": 10
}
```

**Lógica de Recomendación:**
1. Identifica músculos que no se han trabajado en >48 horas
2. Filtra ejercicios que trabajan esos músculos descansados
3. Aplica filtros de dificultad y tipo si se especifican
4. Calcula la duración necesaria para quemar las calorías deseadas
5. Retorna hasta 10 ejercicios recomendados

---

### 2. Listar Ejercicios

```
GET /api/exercises
```

**Parámetros Query:**
- `muscle` (optional): Filtrar por grupo muscular
- `type` (optional): Filtrar por tipo de ejercicio
- `difficulty` (optional): Filtrar por dificultad
- `search` (optional): Buscar por nombre
- `per_page` (optional): Número de resultados por página (default: 15)

**Ejemplo:**
```bash
GET /api/exercises?muscle=biceps&difficulty=beginner&per_page=20
```

**Respuesta:**
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "name": "Dumbbell Curl",
      "type": "strength",
      "muscle": "biceps",
      "equipment": "dumbbell",
      "difficulty": "beginner",
      "instructions": "Stand with dumbbells...",
      "image_url": null,
      "calories_per_minute": 6,
      "created_at": "2025-10-14T00:00:00.000000Z",
      "updated_at": "2025-10-14T00:00:00.000000Z"
    }
  ],
  "total": 25,
  "per_page": 20,
  "last_page": 2
}
```

---

### 3. Ver Detalles de un Ejercicio

```
GET /api/exercises/{exercise_id}
```

**Respuesta:**
```json
{
  "id": 1,
  "name": "Dumbbell Curl",
  "type": "strength",
  "muscle": "biceps",
  "equipment": "dumbbell",
  "difficulty": "beginner",
  "instructions": "Stand with dumbbells at your sides...",
  "image_url": null,
  "calories_per_minute": 6
}
```

---

### 4. Registrar Ejercicio Completado

```
POST /api/exercises/log
```

**Body:**
```json
{
  "exercise_id": 1,
  "duration_minutes": 30,
  "exercise_date": "2025-10-14",
  "notes": "Felt great today!"
}
```

**Respuesta:**
```json
{
  "message": "Exercise logged successfully",
  "exercise": {
    "id": 1,
    "user_id": 1,
    "exercise_id": 1,
    "exercise_date": "2025-10-14",
    "duration_minutes": 30,
    "calories_burned": 180,
    "notes": "Felt great today!",
    "exercise": {
      "id": 1,
      "name": "Dumbbell Curl",
      "muscle": "biceps"
    }
  },
  "calories_burned": 180
}
```

**Efecto:** Actualiza automáticamente el registro de fatiga muscular para el grupo muscular trabajado.

---

### 5. Historial de Ejercicios

```
GET /api/exercises/history
```

**Parámetros Query:**
- `date` (optional): Filtrar por fecha específica (YYYY-MM-DD)
- `from_date` (optional): Fecha inicio del rango
- `to_date` (optional): Fecha fin del rango
- `per_page` (optional): Resultados por página

**Ejemplo:**
```bash
GET /api/exercises/history?from_date=2025-10-01&to_date=2025-10-14
```

**Respuesta:**
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 5,
      "user_id": 1,
      "exercise_id": 1,
      "exercise_date": "2025-10-14",
      "duration_minutes": 30,
      "calories_burned": 180,
      "notes": "Felt great!",
      "exercise": {
        "id": 1,
        "name": "Dumbbell Curl",
        "type": "strength",
        "muscle": "biceps"
      }
    }
  ],
  "total": 15
}
```

---

### 6. Resumen Diario de Ejercicios

```
GET /api/exercises/summary
```

**Parámetros Query:**
- `date` (optional): Fecha para el resumen (default: hoy)

**Ejemplo:**
```bash
GET /api/exercises/summary?date=2025-10-14
```

**Respuesta:**
```json
{
  "date": "2025-10-14",
  "total_exercises": 3,
  "total_calories_burned": 450,
  "total_duration_minutes": 90,
  "exercises": [
    {
      "id": 1,
      "exercise_id": 1,
      "duration_minutes": 30,
      "calories_burned": 180,
      "exercise": {
        "name": "Dumbbell Curl",
        "muscle": "biceps"
      }
    }
  ]
}
```

---

### 7. Estado de Músculos

Muestra qué músculos están descansados o fatigados.

```
GET /api/exercises/muscle-status
```

**Respuesta:**
```json
{
  "muscle_status": [
    {
      "muscle": "biceps",
      "status": "fatigued",
      "days_since_worked": 1,
      "last_worked_date": "2025-10-13",
      "intensity_level": 3
    },
    {
      "muscle": "chest",
      "status": "rested",
      "days_since_worked": 3,
      "last_worked_date": "2025-10-11",
      "intensity_level": 4
    },
    {
      "muscle": "quadriceps",
      "status": "rested",
      "days_since_worked": null,
      "last_worked_date": null
    }
  ],
  "rested_muscles": [
    "chest",
    "quadriceps",
    "triceps"
  ],
  "fatigued_muscles": [
    "biceps"
  ]
}
```

**Lógica:**
- `rested`: >48 horas desde último ejercicio
- `fatigued`: <48 horas desde último ejercicio
- `null`: Nunca trabajado (se considera descansado)

---

### 8. Catálogos

#### Tipos de Ejercicio
```
GET /api/exercises/types
```

**Respuesta:**
```json
{
  "types": [
    "cardio",
    "olympic_weightlifting",
    "plyometrics",
    "powerlifting",
    "strength",
    "stretching",
    "strongman"
  ]
}
```

#### Grupos Musculares
```
GET /api/exercises/muscles
```

**Respuesta:**
```json
{
  "muscles": [
    "abdominals",
    "biceps",
    "chest",
    "glutes",
    "hamstrings",
    "lats",
    "quadriceps",
    "triceps"
  ]
}
```

#### Niveles de Dificultad
```
GET /api/exercises/difficulties
```

**Respuesta:**
```json
{
  "difficulties": ["beginner", "intermediate", "expert"]
}
```

---

### 9. Sincronizar Ejercicios desde API Externa

```
POST /api/exercises/sync
```

**Parámetros Query (opcional):**
- `muscle`: Sincronizar solo un grupo muscular específico

**Ejemplo:**
```bash
POST /api/exercises/sync?muscle=biceps
```

**Respuesta:**
```json
{
  "message": "Synced exercises for muscle: biceps",
  "count": 15
}
```

**Sin parámetro (sincronizar todos):**
```bash
POST /api/exercises/sync
```

**Respuesta:**
```json
{
  "message": "All exercises synced successfully",
  "total_synced": 245
}
```

**Nota:** Este proceso puede tomar varios minutos si sincronizas todos los grupos musculares.

---

## Estimación de Calorías

El sistema estima calorías por minuto basándose en:

### Por Tipo de Ejercicio:
- **Cardio**: 10 cal/min
- **Olympic Weightlifting**: 8 cal/min
- **Plyometrics**: 9 cal/min
- **Powerlifting**: 7 cal/min
- **Strength**: 6 cal/min
- **Stretching**: 3 cal/min
- **Strongman**: 8 cal/min

### Multiplicador por Dificultad:
- **Beginner**: 1.0x
- **Intermediate**: 1.2x
- **Expert**: 1.5x

**Ejemplo:**
- Ejercicio: Cardio (10 cal/min) + Expert (1.5x) = 15 cal/min
- Para quemar 300 calorías: 300 / 15 = 20 minutos

---

## Sistema de Prevención de Fatiga

### Regla de 48 Horas

Cuando un usuario registra un ejercicio:
1. El sistema marca el grupo muscular trabajado
2. Ese músculo se considera "fatigado" por 48 horas
3. Las recomendaciones **no incluyen** ejercicios que trabajen músculos fatigados
4. Después de 48 horas, el músculo vuelve a "descansado"

### Ejemplo de Flujo:

**Día 1 - Lunes:**
```bash
POST /api/exercises/log
{
  "exercise_id": 1,  // Dumbbell Curl (biceps)
  "duration_minutes": 30
}
```

**Día 2 - Martes:**
```bash
GET /api/exercises/muscle-status
```

Respuesta muestra `biceps` como `fatigued`

```bash
GET /api/exercises/recommendations?calories_to_burn=300
```

Respuesta **NO incluye** ejercicios de bíceps, solo músculos descansados (chest, legs, etc.)

**Día 4 - Jueves (>48 horas):**
```bash
GET /api/exercises/muscle-status
```

Respuesta muestra `biceps` como `rested`

```bash
GET /api/exercises/recommendations?calories_to_burn=300
```

Respuesta **SÍ incluye** ejercicios de bíceps nuevamente

---

## Flujo Completo para la App Móvil

### 1. Al abrir la sección de ejercicios:

```javascript
// Obtener estado de músculos
const muscleStatus = await fetch('/api/exercises/muscle-status', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Obtener recomendaciones
const recommendations = await fetch('/api/exercises/recommendations?calories_to_burn=300', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 2. Mostrar ejercicio al usuario:

```javascript
recommendations.recommended_exercises.forEach(exercise => {
  console.log(exercise.name);                    // Nombre del ejercicio
  console.log(exercise.instructions);            // Instrucciones completas
  console.log(exercise.recommended_duration_minutes); // Tiempo necesario
  console.log(exercise.muscle);                  // Músculo trabajado
  console.log(exercise.difficulty);              // Dificultad
  console.log(exercise.type);                    // Tipo de ejercicio
  console.log(exercise.equipment);               // Equipo necesario
  console.log(exercise.estimated_calories_burned); // Calorías estimadas
});
```

### 3. Cuando el usuario completa el ejercicio:

```javascript
await fetch('/api/exercises/log', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    exercise_id: exercise.id,
    duration_minutes: 30,
    notes: 'Completado con éxito!'
  })
});
```

### 4. Mostrar resumen del día:

```javascript
const summary = await fetch('/api/exercises/summary', {
  headers: { 'Authorization': `Bearer ${token}` }
});

console.log(`Total calorías quemadas hoy: ${summary.total_calories_burned}`);
console.log(`Tiempo total de ejercicio: ${summary.total_duration_minutes} min`);
```

---

## Imágenes de Ejercicios

El campo `image_url` está disponible en el modelo, pero actualmente la API de Ninjas no provee imágenes.

### Opciones para agregar imágenes:

#### Opción 1: URLs Manuales
Puedes actualizar ejercicios manualmente con URLs de imágenes:

```sql
UPDATE exercises
SET image_url = 'https://example.com/dumbbell-curl.jpg'
WHERE name = 'Dumbbell Curl';
```

#### Opción 2: Servicio de Imágenes de Ejercicios
Integrar con servicios como:
- ExerciseDB API (requiere suscripción premium)
- Unsplash API (fotos genéricas de ejercicios)
- Pexels API (fotos genéricas)

#### Opción 3: Placeholder Genérico
Usar placeholders por tipo de ejercicio:

```javascript
function getExercisePlaceholder(exercise) {
  const placeholders = {
    'cardio': 'https://example.com/cardio-placeholder.jpg',
    'strength': 'https://example.com/strength-placeholder.jpg',
    // ... etc
  };

  return exercise.image_url || placeholders[exercise.type];
}
```

---

## Base de Datos

### Tabla: `exercises`
Cachea ejercicios de la API externa.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | ID único |
| name | string | Nombre del ejercicio |
| type | string | Tipo de ejercicio |
| muscle | string | Grupo muscular |
| equipment | string | Equipo necesario |
| difficulty | string | Nivel de dificultad |
| instructions | text | Instrucciones completas |
| image_url | string | URL de imagen (opcional) |
| calories_per_minute | int | Estimación de calorías/min |

### Tabla: `user_exercises`
Historial de ejercicios completados por usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | ID único |
| user_id | bigint | ID del usuario |
| exercise_id | bigint | ID del ejercicio |
| exercise_date | date | Fecha del ejercicio |
| duration_minutes | int | Duración en minutos |
| calories_burned | int | Calorías quemadas |
| notes | text | Notas del usuario |

### Tabla: `user_muscle_fatigue`
Tracking de fatiga muscular.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | ID único |
| user_id | bigint | ID del usuario |
| muscle_group | string | Grupo muscular |
| last_worked_date | date | Última vez trabajado |
| intensity_level | int | Nivel de intensidad (1-5) |

---

## Preguntas Frecuentes (FAQ)

### ¿Necesito sincronizar ejercicios cada vez?
No, solo una vez. Los ejercicios se cachean en tu base de datos local.

### ¿Cuánto cuesta la API de Ninjas?
Tiene un tier gratuito con límite de requests. Para producción, considera el tier premium.

### ¿Puedo modificar las estimaciones de calorías?
Sí, puedes editar el método `estimateCaloriesPerMinute()` en `ExerciseApiService.php`.

### ¿Qué pasa si un usuario quiere trabajar un músculo fatigado?
Puede buscar ejercicios manualmente con `/api/exercises?muscle=biceps` sin usar las recomendaciones.

### ¿Cómo cambio el tiempo de descanso de 48 horas?
Edita el método `isRested()` en el modelo `UserMuscleFatigue.php`.

---

## Resumen para el Frontend

**Lo que necesitas implementar en la app móvil:**

1. **Pantalla de Recomendaciones:**
   - Pedir al usuario cuántas calorías quiere quemar
   - Llamar a `/api/exercises/recommendations`
   - Mostrar ejercicios con: nombre, tiempo, instrucciones, músculo, dificultad

2. **Detalle del Ejercicio:**
   - Mostrar instrucciones completas
   - Mostrar imagen (si está disponible)
   - Botón "Completar Ejercicio"

3. **Registrar Ejercicio:**
   - Al completar, llamar a `/api/exercises/log`
   - Guardar duración y calorías quemadas

4. **Historial:**
   - Mostrar lista de ejercicios completados
   - Totales de calorías y tiempo

5. **Estado de Músculos (Opcional):**
   - Vista de qué músculos están descansados/fatigados
   - Ayuda al usuario a planificar

**Lo que el backend ya hace por ti:**
- ✅ Calcula automáticamente la duración necesaria
- ✅ Filtra músculos fatigados
- ✅ Estima calorías quemadas
- ✅ Registra historial y fatiga muscular
- ✅ Provee catálogos de filtros

