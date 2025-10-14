# NutriCoach API - Documentación Completa

## 📖 Información General

Esta API REST proporciona todos los servicios necesarios para aplicaciones móviles y web que consuman el sistema NutriCoach Luis, un agente de inteligencia artificial especializado en seguimiento nutricional y análisis calórico personalizado.

**Base URL:** `http://localhost:8000/api`
**Versión:** 1.0
**Autenticación:** Laravel Sanctum (Bearer Token)

---

## 🔐 Autenticación

### Obtener Token de Acceso

La API utiliza Laravel Sanctum para autenticación. Existen dos métodos principales:

#### 1. Autenticación con Google OAuth
```http
GET /auth/google/redirect
```
Redirige al usuario a Google para autenticación.

```http
GET /auth/google/callback
```
Callback que recibe el token de Google y crea/actualiza el usuario.

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "Usuario Ejemplo",
    "email": "usuario@example.com",
    "avatar": "https://..."
  },
  "token": "1|abc123..."
}
```

#### 2. Obtener Usuario Autenticado
```http
GET /api/user
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": 1,
  "name": "Usuario Ejemplo",
  "email": "usuario@example.com",
  "email_verified_at": "2025-01-01T00:00:00.000000Z",
  "avatar": "https://...",
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-01T00:00:00.000000Z"
}
```

---

## 👤 Perfil de Usuario

### Obtener Perfil
```http
GET /api/profile
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Perfil obtenido exitosamente",
  "data": {
    "id": 1,
    "user_id": 1,
    "height": 175.00,
    "weight": 95.50,
    "age": 30,
    "gender": "male",
    "activity_level": "moderate",
    "daily_calorie_goal": 2000,
    "protein_goal": 150.00,
    "carbs_goal": 200.00,
    "fat_goal": 65.00,
    "water_goal": 4500,
    "target_weight": 75.00,
    "target_date": "2025-12-31",
    "medical_conditions": null,
    "dietary_restrictions": null,
    "is_medically_supervised": true,
    "bmi": 31.18,
    "bmi_category": "obese"
  }
}
```

### Crear Perfil
```http
POST /api/profile
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "height": 175.00,
  "weight": 95.50,
  "age": 30,
  "gender": "male",
  "activity_level": "moderate",
  "daily_calorie_goal": 2000,
  "protein_goal": 150,
  "carbs_goal": 200,
  "fat_goal": 65,
  "water_goal": 4500,
  "target_weight": 75,
  "target_date": "2025-12-31",
  "is_medically_supervised": true
}
```

**Valores permitidos:**
- `gender`: male, female, other
- `activity_level`: sedentary, light, moderate, active, very_active

### Actualizar Perfil
```http
PUT /api/profile
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:** (todos los campos son opcionales)
```json
{
  "weight": 93.00,
  "daily_calorie_goal": 1900
}
```

---

## 🍎 Alimentos (Foods)

### Listar Alimentos
```http
GET /api/foods
Authorization: Bearer {token}
```

**Query Parameters:**
- `search` - Buscar por nombre o descripción
- `category` - Filtrar por categoría (protein, carbs, fats, vegetables, supplements)
- `tags` - Filtrar por tags (array)
- `per_page` - Elementos por página (default: 20)

**Ejemplo:**
```http
GET /api/foods?search=pollo&category=protein&per_page=10
```

**Response:**
```json
{
  "message": "Alimentos obtenidos exitosamente",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "name": "Pechuga de Pollo",
        "description": "Pechuga de pollo cocida sin piel",
        "category": "protein",
        "calories_per_100g": 165,
        "protein_per_100g": 31.00,
        "carbs_per_100g": 0.00,
        "fat_per_100g": 3.60,
        "fiber_per_100g": 0.00,
        "sugar_per_100g": 0.00,
        "sodium_per_100g": 74.00,
        "unit": "g",
        "is_cooked": true,
        "cooking_method": "grilled",
        "tags": ["high_protein", "low_carb", "healthy"],
        "is_active": true
      }
    ],
    "per_page": 10,
    "total": 15
  }
}
```

### Obtener Alimento por ID
```http
GET /api/foods/{id}
Authorization: Bearer {token}
```

### Obtener Categorías
```http
GET /api/foods/categories
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Categorías obtenidas exitosamente",
  "data": [
    { "name": "protein", "label": "Proteínas", "count": 5 },
    { "name": "carbs", "label": "Carbohidratos", "count": 4 },
    { "name": "fats", "label": "Grasas", "count": 2 },
    { "name": "vegetables", "label": "Verduras", "count": 3 },
    { "name": "supplements", "label": "Suplementos", "count": 1 }
  ]
}
```

### Obtener Tags Populares
```http
GET /api/foods/tags
Authorization: Bearer {token}
```

### Calcular Nutrición para Cantidad
```http
POST /api/foods/{id}/calculate
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "quantity": 150
}
```

**Response:**
```json
{
  "message": "Nutrición calculada exitosamente",
  "data": {
    "food_item": "Pechuga de Pollo",
    "quantity": 150,
    "unit": "g",
    "nutrition": {
      "calories": 248,
      "protein": 46.50,
      "carbs": 0.00,
      "fat": 5.40,
      "fiber": 0.00,
      "sugar": 0.00,
      "sodium": 111.00
    }
  }
}
```

---

## 📊 Datos Nutricionales

### Listar Registros Nutricionales
```http
GET /api/nutrition
Authorization: Bearer {token}
```

**Query Parameters:**
- `date` - Filtrar por fecha específica (YYYY-MM-DD)
- `start_date` y `end_date` - Filtrar por rango de fechas
- `meal_type` - Filtrar por tipo de comida
- `per_page` - Elementos por página (default: 20)

**Ejemplo:**
```http
GET /api/nutrition?date=2025-01-15&meal_type=breakfast
```

**Response:**
```json
{
  "message": "Datos nutricionales obtenidos exitosamente",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "user_id": 1,
        "food_item_id": 1,
        "consumption_date": "2025-01-15",
        "meal_type": "breakfast",
        "quantity": 150.00,
        "unit": "g",
        "calories": 248,
        "protein": 46.50,
        "carbs": 0.00,
        "fat": 5.40,
        "fiber": 0.00,
        "sugar": 0.00,
        "sodium": 111.00,
        "notes": null,
        "mood": "good",
        "energy_level": 8,
        "hunger_level": 3,
        "was_planned": true,
        "context": null,
        "food_item": {
          "id": 1,
          "name": "Pechuga de Pollo",
          "category": "protein"
        }
      }
    ]
  }
}
```

### Crear Registro Nutricional
```http
POST /api/nutrition
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "food_item_id": 1,
  "consumption_date": "2025-01-15",
  "meal_type": "breakfast",
  "quantity": 150,
  "unit": "g",
  "notes": "Desayuno proteico",
  "mood": "good",
  "energy_level": 8,
  "hunger_level": 3,
  "was_planned": true,
  "context": {
    "location": "home",
    "companions": "alone"
  }
}
```

**Valores permitidos:**
- `meal_type`: breakfast, lunch, dinner, snack, pre_workout, post_workout
- `mood`: excellent, good, neutral, poor, terrible
- `energy_level`: 1-10
- `hunger_level`: 1-10

### Obtener Resumen Diario
```http
GET /api/nutrition/daily-summary
Authorization: Bearer {token}
```

**Query Parameters:**
- `date` - Fecha específica (default: hoy)

**Response:**
```json
{
  "message": "Resumen diario obtenido exitosamente",
  "data": {
    "date": "2025-01-15",
    "summary": {
      "total_calories": 1950,
      "total_protein": 145.50,
      "total_carbs": 195.00,
      "total_fat": 62.00,
      "total_fiber": 25.00,
      "total_sugar": 30.00,
      "total_sodium": 1800.00,
      "total_entries": 5
    },
    "meal_type_summary": [
      {
        "meal_type": "breakfast",
        "calories": 450,
        "protein": 35.00,
        "carbs": 40.00,
        "fat": 12.00,
        "entries": 2
      }
    ],
    "goals": {
      "calories": 2000,
      "protein": 150.00,
      "carbs": 200.00,
      "fat": 65.00
    },
    "adherence": {
      "status": "green",
      "message": "Dentro del rango objetivo",
      "details": {
        "calories": "green",
        "protein": "green",
        "carbs": "green",
        "fat": "green"
      }
    }
  }
}
```

### Obtener Resumen Semanal
```http
GET /api/nutrition/weekly-summary
Authorization: Bearer {token}
```

**Query Parameters:**
- `start_date` - Fecha de inicio (default: inicio de semana actual)
- `end_date` - Fecha de fin (default: fin de semana actual)

---

## 💧 Hidratación

### Listar Registros de Hidratación
```http
GET /api/hydration
Authorization: Bearer {token}
```

**Query Parameters:**
- `date` - Filtrar por fecha específica
- `start_date` y `end_date` - Filtrar por rango
- `drink_type` - Filtrar por tipo de bebida
- `per_page` - Elementos por página

### Crear Registro de Hidratación
```http
POST /api/hydration
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "date": "2025-01-15",
  "time": "08:30:00",
  "amount_ml": 500,
  "drink_type": "water",
  "notes": "Primera hidratación del día"
}
```

**Tipos de bebida:**
- `water` - Agua
- `tea` - Té
- `coffee` - Café
- `juice` - Jugo
- `sports_drink` - Bebida deportiva
- `other` - Otro

### Obtener Resumen Diario de Hidratación
```http
GET /api/hydration/daily-summary
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Resumen diario de hidratación obtenido exitosamente",
  "data": {
    "date": "2025-01-15",
    "total_ml": 3500,
    "goal_ml": 4500,
    "percentage": 77.78,
    "entries": 7,
    "drink_types": {
      "water": 3000,
      "tea": 500
    },
    "status": "on_track"
  }
}
```

### Obtener Tipos de Bebidas
```http
GET /api/hydration/drink-types
Authorization: Bearer {token}
```

---

## 🤖 Coaching (Comandos Especiales)

### Obtener Mensajes de Coaching
```http
GET /api/coaching/messages
Authorization: Bearer {token}
```

**Query Parameters:**
- `type` - Filtrar por tipo de mensaje
- `unread_only` - Solo mensajes no leídos (true/false)
- `per_page` - Elementos por página

### Marcar Mensaje como Leído
```http
POST /api/coaching/messages/{id}/read
Authorization: Bearer {token}
```

### Resumen del Día
```http
POST /api/coaching/daily-summary
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "date": "2025-01-15"
}
```

**Response:**
```json
{
  "message": "Resumen del día generado exitosamente",
  "data": {
    "date": "2025-01-15",
    "summary": { /* datos nutricionales */ },
    "insights": {
      "adherence": {
        "status": "green",
        "message": "Dentro del rango objetivo"
      },
      "calories": "¡Excelente! Estás dentro de tu rango objetivo de calorías."
    },
    "coaching_message": {
      "id": 1,
      "type": "daily_summary",
      "title": "Resumen del Día",
      "message": "Hoy tuviste un día exitoso...",
      "is_read": false
    }
  }
}
```

### ¿Cómo Voy? (Chequeo de Progreso)
```http
POST /api/coaching/progress-check
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Análisis de progreso generado exitosamente",
  "data": {
    "weekly_data": [ /* datos de 7 días */ ],
    "trends": {
      "calories_trend": "stable",
      "adherence_trend": "improving",
      "consistency_score": 75
    },
    "progress_message": "Tu progreso muestra una tendencia estable...",
    "coaching_message": { /* mensaje de coaching */ }
  }
}
```

### Día Difícil
```http
POST /api/coaching/difficult-day
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Estrategias para día difícil generadas exitosamente",
  "data": {
    "strategies": {
      "flexibilidad_inteligente": {
        "title": "Flexibilidad Inteligente",
        "message": "Recuerda que el 80% de adherencia es más sostenible...",
        "actions": [
          "Ajusta tus expectativas para hoy",
          "Enfócate en las comidas que sí puedes controlar",
          "Planifica mejor para mañana"
        ]
      },
      "autocompasion": { /* ... */ },
      "estrategias_practicas": { /* ... */ }
    },
    "coaching_message": { /* mensaje de coaching */ }
  }
}
```

### SOS Antojo
```http
POST /api/coaching/craving-sos
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "sweet"
}
```

**Tipos de antojos:**
- `sweet` - Dulce
- `salty` - Salado
- `general` - General

**Response:**
```json
{
  "message": "Estrategias anti-antojos generadas exitosamente",
  "data": {
    "craving_type": "sweet",
    "strategies": [
      "Bebe un vaso de agua con limón",
      "Come una fruta fresca",
      "Mastica chicle sin azúcar",
      "Haz 10 respiraciones profundas"
    ],
    "coaching_message": { /* mensaje de coaching */ }
  }
}
```

### Situación Social
```http
POST /api/coaching/social-situation
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "restaurant"
}
```

**Tipos de situaciones:**
- `restaurant` - Restaurante
- `party` - Fiesta
- `family` - Reunión familiar
- `work` - Trabajo

**Response:**
```json
{
  "message": "Tips para situación social generados exitosamente",
  "data": {
    "situation_type": "restaurant",
    "tips": [
      "Revisa el menú antes de llegar",
      "Pide aderezos y salsas aparte",
      "Comparte el plato principal",
      "Pide agua como bebida principal"
    ],
    "coaching_message": { /* mensaje de coaching */ }
  }
}
```

---

## 🚨 Alertas y Seguridad

### Obtener Alertas Activas
```http
GET /api/alerts
Authorization: Bearer {token}
```

**Query Parameters:**
- `type` - Filtrar por tipo
- `severity` - Filtrar por severidad (info, warning, danger)
- `per_page` - Elementos por página

**Response:**
```json
{
  "message": "Alertas obtenidas exitosamente",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "user_id": 1,
        "type": "hydration_reminder",
        "title": "Recordatorio de Hidratación",
        "message": "Tu hidratación está por debajo del 50% de tu meta diaria.",
        "data": {
          "current_ml": 1500,
          "goal_ml": 4500,
          "percentage": 33.33
        },
        "severity": "info",
        "is_dismissed": false,
        "expires_at": "2025-01-15T14:00:00.000000Z"
      }
    ]
  }
}
```

### Verificar y Generar Alertas
```http
POST /api/alerts/check
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Verificación de alertas completada",
  "data": {
    "alerts_generated": 2,
    "alerts": [
      { /* alerta 1 */ },
      { /* alerta 2 */ }
    ]
  }
}
```

### Desestimar Alerta
```http
POST /api/alerts/{id}/dismiss
Authorization: Bearer {token}
```

### Obtener Disclaimer Médico
```http
GET /api/alerts/medical-disclaimer
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Disclaimer médico obtenido exitosamente",
  "data": {
    "disclaimer_text": "IMPORTANTE: Este sistema...",
    "version": "1.0",
    "required": true
  }
}
```

### Aceptar Disclaimer Médico
```http
POST /api/alerts/medical-disclaimer/accept
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "disclaimer_text": "IMPORTANTE: Este sistema...",
  "version": "1.0"
}
```

---

## 🎯 Contexto Adaptativo

### Listar Contextos del Usuario
```http
GET /api/context
Authorization: Bearer {token}
```

**Query Parameters:**
- `date` - Filtrar por fecha
- `start_date` y `end_date` - Filtrar por rango
- `context_type` - Filtrar por tipo
- `per_page` - Elementos por página

### Crear Contexto
```http
POST /api/context
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "date": "2025-01-15",
  "context_type": "stressful_day",
  "stress_level": 8,
  "energy_level": 4,
  "mood": "poor",
  "notes": "Día muy estresante en el trabajo",
  "affects_adherence": true
}
```

**Tipos de contexto:**
- `normal_day` - Día normal
- `stressful_day` - Día estresante
- `weekend` - Fin de semana
- `sick_day` - Día enfermo
- `travel_day` - Día de viaje
- `celebration` - Celebración
- `other` - Otro

### Obtener Tolerancia Ajustada
```http
GET /api/context/tolerance
Authorization: Bearer {token}
```

**Query Parameters:**
- `date` - Fecha específica

**Response:**
```json
{
  "message": "Tolerancia ajustada obtenida exitosamente",
  "data": {
    "date": "2025-01-15",
    "base_tolerance": {
      "calories": 100,
      "macros": 15
    },
    "adjusted_tolerance": {
      "calories": 200,
      "macros": 25
    },
    "context": {
      "type": "stressful_day",
      "adjustment_factor": 2.0
    }
  }
}
```

### Evaluar Adherencia con Contexto
```http
GET /api/context/adherence
Authorization: Bearer {token}
```

**Query Parameters:**
- `date` - Fecha específica

### Obtener Recomendaciones Contextuales
```http
GET /api/context/recommendations
Authorization: Bearer {token}
```

**Query Parameters:**
- `date` - Fecha específica

---

## 🍽️ Planes de Comida

### Listar Planes de Comida
```http
GET /api/meal-plans
Authorization: Bearer {token}
```

**Query Parameters:**
- `date` - Filtrar por fecha
- `start_date` y `end_date` - Filtrar por rango
- `meal_type` - Filtrar por tipo de comida
- `is_completed` - Filtrar por completitud (true/false)
- `per_page` - Elementos por página

### Crear Plan de Comida
```http
POST /api/meal-plans
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "date": "2025-01-15",
  "meal_type": "breakfast",
  "planned_time": "08:00:00",
  "food_item_id": 1,
  "planned_quantity": 150,
  "planned_calories": 248,
  "planned_protein": 46.50,
  "planned_carbs": 0.00,
  "planned_fat": 5.40,
  "notes": "Desayuno alto en proteína"
}
```

### Generar Plan Automático
```http
POST /api/meal-plans/generate
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "start_date": "2025-01-15",
  "days": 7
}
```

**Response:**
```json
{
  "message": "Plan de comidas generado exitosamente",
  "data": {
    "generated_plans": 21,
    "start_date": "2025-01-15",
    "end_date": "2025-01-21",
    "daily_distribution": {
      "breakfast": 450,
      "lunch": 600,
      "dinner": 550,
      "snack": 400
    }
  }
}
```

### Obtener Resumen Diario del Plan
```http
GET /api/meal-plans/daily-summary
Authorization: Bearer {token}
```

**Query Parameters:**
- `date` - Fecha específica

### Obtener Progreso Semanal del Plan
```http
GET /api/meal-plans/weekly-progress
Authorization: Bearer {token}
```

**Query Parameters:**
- `start_date` - Fecha de inicio
- `end_date` - Fecha de fin

### Marcar Plan como Completado
```http
POST /api/meal-plans/{id}/complete
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "completed_at": "2025-01-15T08:30:00Z",
  "actual_quantity": 150,
  "notes": "Completado según lo planificado"
}
```

---

## 📋 Códigos de Error

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Solicitud mal formada |
| 401 | Unauthorized - Autenticación requerida |
| 403 | Forbidden - No autorizado para este recurso |
| 404 | Not Found - Recurso no encontrado |
| 422 | Unprocessable Entity - Errores de validación |
| 500 | Internal Server Error - Error del servidor |

### Formato de Error
```json
{
  "message": "Descripción del error",
  "errors": {
    "campo": ["Mensaje de validación específico"]
  }
}
```

---

## 🎨 Sistema de Evaluación (Código de Colores)

### Verde (✅)
- **Criterio:** Dentro del rango objetivo
- **Tolerancia:** ±100 kcal, ±15g macros

### Amarillo (⚠️)
- **Criterio:** Ligeramente fuera del rango
- **Tolerancia:** ±200 kcal, ±25g macros

### Rojo (❌)
- **Criterio:** Significativamente fuera del rango
- **Tolerancia:** >200 kcal, >25g macros

**Nota:** La tolerancia se ajusta automáticamente según el contexto del usuario (días estresantes, fines de semana, enfermedades, viajes).

---

## 🔧 Configuración de CORS

La API está configurada para permitir solicitudes desde cualquier origen en desarrollo:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```

**En producción, configura los dominios permitidos en:**
- `config/cors.php`
- `config/sanctum.php` (SANCTUM_STATEFUL_DOMAINS)

---

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd nuticoachback
```

### 2. Instalar Dependencias
```bash
composer install
npm install
```

### 3. Configurar Variables de Entorno
```bash
cp .env.example .env
php artisan key:generate
```

**Actualizar `.env` con:**
```env
APP_NAME="NutriCoach API"
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite

SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,localhost:5173

FRONTEND_URL=http://localhost:3000
MOBILE_APP_URL=nutricoach://

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. Migrar y Poblar Base de Datos
```bash
php artisan migrate --seed
```

### 5. Instalar Sanctum
```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### 6. Iniciar Servidor
```bash
php artisan serve
```

La API estará disponible en: `http://localhost:8000/api`

---

## 📱 Ejemplo de Integración (React Native)

```javascript
// api.js
const API_BASE_URL = 'http://localhost:8000/api';

export const apiClient = {
  async request(endpoint, options = {}) {
    const token = await AsyncStorage.getItem('auth_token');

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en la solicitud');
    }

    return data;
  },

  // Métodos específicos
  async getDailySummary(date) {
    return this.request(`/nutrition/daily-summary?date=${date}`);
  },

  async createNutritionalData(data) {
    return this.request('/nutrition', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getCoachingMessages() {
    return this.request('/coaching/messages');
  },
};
```

---

## 📞 Soporte

Para más información, consulta:
- `estructurasistemapp.md` - Descripción completa del sistema
- `IMPLEMENTACION_COMPLETA.md` - Detalles de implementación

**Paleta de Colores del Sistema:**
- BG: E0FE10 / 1C2227
- Text: FFFFFF / 434B53

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.
