# 🧠 Perfil de Usuario - Centro del Sistema NutriCoach

## 📋 Índice
1. [Introducción](#introducción)
2. [¿Qué es el Perfil de Usuario?](#qué-es-el-perfil-de-usuario)
3. [Datos que Debe Agregar el Usuario](#datos-que-debe-agregar-el-usuario)
4. [Cálculos Automáticos del Sistema](#cálculos-automáticos-del-sistema)
5. [Cómo el Perfil Alimenta Todo el Sistema](#cómo-el-perfil-alimenta-todo-el-sistema)
6. [Flujo de Datos Global](#flujo-de-datos-global)
7. [Casos de Uso Prácticos](#casos-de-uso-prácticos)

---

## 🎯 Introducción

El **Perfil de Usuario** (`user_profiles`) es el **corazón del sistema NutriCoach**. Es como el "DNI nutricional" de cada usuario. Sin un perfil completo, el sistema no puede personalizar las recomendaciones, metas ni análisis.

### ¿Por qué es tan importante?

Todos los módulos del sistema **dependen del perfil** para funcionar correctamente:
- 💧 **Hidratación**: Usa la meta de agua del perfil
- 🍽️ **Nutrición**: Compara el consumo con las metas calóricas y de macros del perfil
- 💪 **Ejercicios**: Ajusta recomendaciones según nivel de actividad y composición corporal
- 🧑‍⚕️ **Coach**: Genera consejos personalizados basados en objetivos, edad, género y tipo de cuerpo
- 📊 **Análisis**: Evalúa el progreso comparando con las metas del perfil

---

## 📝 ¿Qué es el Perfil de Usuario?

El perfil es una **tabla única por usuario** que almacena:
1. **Datos físicos actuales** (altura, peso, edad, género)
2. **Composición corporal** (contextura, grasa corporal, circunferencias)
3. **Nivel de actividad** (sedentario a muy activo)
4. **Objetivos nutricionales** (calorías, proteínas, carbohidratos, grasas, agua)
5. **Metas de peso** (peso objetivo y fecha)
6. **Información médica** (condiciones médicas, restricciones dietéticas)

---

## 🔢 Datos que Debe Agregar el Usuario

### 📌 **DATOS OBLIGATORIOS** (sin estos, el sistema no funciona)

#### 1. **Altura** (`height`)
- **Rango**: 100-250 cm
- **Se usa para**:
  - ✅ Calcular IMC (Índice de Masa Corporal)
  - ✅ Calcular BMR (Metabolismo Basal)
  - ✅ Estimar grasa corporal
  - ✅ Determinar rango de peso ideal

**Ejemplo**: `170` (170 cm = 1.70 m)

---

#### 2. **Peso Actual** (`weight`)
- **Rango**: 30-300 kg
- **Se usa para**:
  - ✅ Calcular IMC
  - ✅ Calcular BMR
  - ✅ Determinar si tiene sobrepeso/obesidad
  - ✅ Calcular déficit calórico para bajar de peso
  - ✅ Seguimiento de progreso

**Ejemplo**: `75` (75 kg)

---

#### 3. **Edad** (`age`)
- **Rango**: 16-100 años
- **Se usa para**:
  - ✅ Calcular BMR (el metabolismo disminuye con la edad)
  - ✅ Ajustar recomendaciones nutricionales
  - ✅ Personalizar consejos del coach

**Ejemplo**: `30` (30 años)

---

#### 4. **Género** (`gender`)
- **Opciones**: `male` (hombre), `female` (mujer), `other` (otro)
- **Se usa para**:
  - ✅ Calcular BMR (hombres y mujeres tienen fórmulas diferentes)
  - ✅ Determinar contextura física (rangos diferentes)
  - ✅ Calcular grasa corporal (fórmulas diferentes)
  - ✅ Evaluar ratio cintura/cadera (rangos de riesgo diferentes)

**Ejemplo**: `"male"`

---

#### 5. **Nivel de Actividad** (`activity_level`)
- **Opciones**:
  - `sedentary`: Trabajo de oficina, poco o nada de ejercicio
  - `light`: Ejercicio ligero 1-3 días/semana
  - `moderate`: Ejercicio moderado 3-5 días/semana
  - `active`: Ejercicio intenso 6-7 días/semana
  - `very_active`: Ejercicio muy intenso, trabajo físico o entrenamiento 2 veces al día

- **Se usa para**:
  - ✅ Calcular TDEE (Gasto Energético Total Diario)
  - ✅ Determinar cuántas calorías necesitas al día
  - ✅ Ajustar metas nutricionales

**Ejemplo**: `"moderate"`

**Multiplicadores**:
- Sedentario: BMR × 1.2
- Ligero: BMR × 1.375
- Moderado: BMR × 1.55
- Activo: BMR × 1.725
- Muy activo: BMR × 1.9

---

### 📌 **DATOS OPCIONALES** (mejoran la precisión)

#### 6. **Contextura Física** (`body_frame`)
- **Opciones**: `small` (delgada), `medium` (media), `large` (robusta)
- **Se usa para**:
  - ✅ Ajustar el rango de peso ideal
  - ✅ Personalizar objetivos según estructura ósea

**Ejemplo**: `"medium"`

**Si NO se proporciona**: El sistema puede calcularlo automáticamente si tienes la circunferencia de muñeca.

---

#### 7. **Tipo de Cuerpo** (`body_type`)
- **Opciones**:
  - `ectomorph`: Metabolismo rápido, dificulta ganar peso
  - `mesomorph`: Estructura atlética, gana músculo fácilmente
  - `endomorph`: Metabolismo lento, tendencia a ganar peso

- **Se usa para**:
  - ✅ Personalizar consejos del coach
  - ✅ Ajustar recomendaciones de macronutrientes
  - ✅ Sugerir tipos de ejercicios

**Ejemplo**: `"mesomorph"`

---

#### 8. **Circunferencia de Muñeca** (`wrist_circumference`)
- **Rango**: 10-30 cm
- **Se usa para**:
  - ✅ Calcular automáticamente la contextura física
  - ✅ Determinar si tienes huesos finos, medios o anchos

**Ejemplo**: `17.5` (17.5 cm)

**Cómo medirla**: Usa una cinta métrica alrededor de la muñeca, justo debajo del hueso que sobresale.

---

#### 9. **Circunferencia de Cintura** (`waist_circumference`)
- **Rango**: 40-200 cm
- **Se usa para**:
  - ✅ Estimar porcentaje de grasa corporal (método US Navy)
  - ✅ Calcular ratio cintura/cadera (WHR)
  - ✅ Evaluar riesgo cardiovascular

**Ejemplo**: `85` (85 cm)

**Cómo medirla**: Coloca la cinta métrica alrededor de la parte más estrecha del abdomen, generalmente a la altura del ombligo.

---

#### 10. **Circunferencia de Cadera** (`hip_circumference`)
- **Rango**: 50-200 cm
- **Se usa para**:
  - ✅ Calcular ratio cintura/cadera (WHR)
  - ✅ Estimar grasa corporal en mujeres
  - ✅ Evaluar distribución de grasa

**Ejemplo**: `95` (95 cm)

**Cómo medirla**: Mide alrededor de la parte más ancha de las caderas/glúteos.

---

#### 11. **Circunferencia de Cuello** (`neck_circumference`)
- **Rango**: 20-60 cm
- **Se usa para**:
  - ✅ Estimar porcentaje de grasa corporal (método US Navy)

**Ejemplo**: `38` (38 cm)

**Cómo medirla**: Mide alrededor del cuello, justo debajo de la manzana de Adán (en hombres).

---

#### 12. **Porcentaje de Grasa Corporal** (`body_fat_percentage`)
- **Rango**: 3-60%
- **Se usa para**:
  - ✅ Evaluar composición corporal
  - ✅ Determinar categoría de salud (essential, athletes, fitness, average, obese)
  - ✅ Personalizar objetivos de pérdida de peso

**Ejemplo**: `18.5` (18.5%)

**Si NO se proporciona**: El sistema puede estimarlo automáticamente si tienes las circunferencias de cintura, cuello (y cadera para mujeres).

---

#### 13. **Porcentaje de Masa Muscular** (`muscle_mass_percentage`)
- **Rango**: 20-70%
- **Se usa para**:
  - ✅ Evaluar composición corporal
  - ✅ Ajustar recomendaciones de proteínas
  - ✅ Personalizar planes de ejercicio

**Ejemplo**: `45` (45%)

---

#### 14. **Peso Objetivo** (`target_weight`)
- **Rango**: 30-300 kg
- **Se usa para**:
  - ✅ Calcular déficit o superávit calórico
  - ✅ Determinar cuántas calorías necesitas para alcanzar tu meta
  - ✅ Seguimiento de progreso
  - ✅ Motivación del coach

**Ejemplo**: `68` (68 kg)

---

#### 15. **Fecha Objetivo** (`target_date`)
- **Formato**: YYYY-MM-DD
- **Se usa para**:
  - ✅ Calcular cuánto tiempo tienes para alcanzar tu meta
  - ✅ Determinar la velocidad de pérdida de peso segura
  - ✅ Ajustar déficit calórico diario

**Ejemplo**: `"2025-06-01"`

---

#### 16. **Condiciones Médicas** (`medical_conditions`)
- **Tipo**: Texto libre (hasta 1000 caracteres)
- **Se usa para**:
  - ✅ Ajustar recomendaciones nutricionales
  - ✅ Alertar al coach sobre restricciones
  - ✅ Personalizar consejos de salud

**Ejemplo**: `"Diabetes tipo 2, hipertensión"`

---

#### 17. **Restricciones Dietéticas** (`dietary_restrictions`)
- **Tipo**: Texto libre (hasta 1000 caracteres)
- **Se usa para**:
  - ✅ Filtrar alimentos en recomendaciones
  - ✅ Personalizar planes de comida
  - ✅ Alertar sobre alimentos prohibidos

**Ejemplo**: `"Intolerancia a la lactosa, vegetariano"`

---

#### 18. **Supervisión Médica** (`is_medically_supervised`)
- **Tipo**: Booleano (true/false)
- **Se usa para**:
  - ✅ Ajustar límites de déficit calórico
  - ✅ Mostrar advertencias especiales
  - ✅ Validar cambios drásticos

**Ejemplo**: `true`

---

## 🤖 Cálculos Automáticos del Sistema

Una vez que el usuario proporciona los datos básicos, el sistema **calcula automáticamente**:

### 1. **IMC (Índice de Masa Corporal)**
```
IMC = peso / (altura_en_metros²)
```

**Categorías**:
- `< 18.5`: Bajo peso
- `18.5 - 24.9`: Normal ✅
- `25 - 29.9`: Sobrepeso ⚠️
- `≥ 30`: Obesidad 🔴

**Ejemplo**: Peso 75 kg, altura 1.70 m → IMC = 25.95 (Sobrepeso)

---

### 2. **BMR (Metabolismo Basal)**
Calorías que tu cuerpo necesita en reposo absoluto.

**Fórmula Mifflin-St Jeor**:
- **Hombres**: `10 × peso + 6.25 × altura - 5 × edad + 5`
- **Mujeres**: `10 × peso + 6.25 × altura - 5 × edad - 161`

**Ejemplo (Hombre, 30 años, 75 kg, 170 cm)**:
```
BMR = 10 × 75 + 6.25 × 170 - 5 × 30 + 5
BMR = 750 + 1062.5 - 150 + 5
BMR = 1667.5 kcal/día
```

---

### 3. **TDEE (Gasto Energético Total Diario)**
Calorías totales que necesitas al día considerando tu actividad física.

```
TDEE = BMR × multiplicador_de_actividad
```

**Ejemplo (Actividad moderada)**:
```
TDEE = 1667.5 × 1.55 = 2584 kcal/día
```

---

### 4. **Meta Calórica Ajustada**
Si tienes un peso objetivo, el sistema calcula cuántas calorías necesitas para alcanzarlo.

**Fórmula**:
```
1 kg de grasa = 7700 kcal
Déficit semanal = (peso_actual - peso_objetivo) × 7700 / semanas_disponibles
Déficit diario = déficit_semanal / 7
Meta calórica = TDEE - déficit_diario
```

**Protección**: No permite menos del 110% del BMR para evitar daños metabólicos.

**Ejemplo**:
- Peso actual: 75 kg
- Peso objetivo: 68 kg
- Fecha objetivo: 3 meses (12 semanas)
- Déficit semanal: `(75 - 68) × 7700 / 12 = 4491 kcal/semana`
- Déficit diario: `4491 / 7 = 642 kcal/día`
- Meta calórica: `2584 - 642 = 1942 kcal/día` ✅

---

### 5. **Macronutrientes Automáticos**
El sistema calcula las metas de proteínas, carbohidratos y grasas.

**Distribución por defecto**:
- **Proteínas**: 30% de calorías (÷ 4 kcal/g)
- **Carbohidratos**: 40% de calorías (÷ 4 kcal/g)
- **Grasas**: 30% de calorías (÷ 9 kcal/g)

**Ejemplo (Meta: 1942 kcal)**:
- Proteínas: `1942 × 0.30 / 4 = 145 g/día`
- Carbohidratos: `1942 × 0.40 / 4 = 194 g/día`
- Grasas: `1942 × 0.30 / 9 = 65 g/día`

---

### 6. **Meta de Hidratación**
Por defecto: **4000 ml/día (4 litros)**

Puede ajustarse según:
- Nivel de actividad
- Clima
- Composición corporal

---

### 7. **Contextura Física Automática**
Si proporcionas la circunferencia de muñeca:

```
r-value = altura / circunferencia_muñeca
```

**Hombres**:
- r-value > 10.4 → `small`
- r-value 9.6-10.4 → `medium`
- r-value < 9.6 → `large`

**Mujeres**:
- r-value > 11.0 → `small`
- r-value 10.1-11.0 → `medium`
- r-value < 10.1 → `large`

---

### 8. **Estimación de Grasa Corporal**
Si proporcionas cintura, cuello (y cadera para mujeres), el sistema estima tu % de grasa usando el **Método US Navy**.

---

### 9. **Rango de Peso Ideal**
Usa la **Fórmula de Devine** ajustada por contextura física.

**Ejemplo (Hombre, 1.70 m, contextura media)**:
- Peso ideal base: 68 kg
- Rango ajustado: **64.6 - 71.4 kg**

---

## 🌍 Cómo el Perfil Alimenta Todo el Sistema

### 💧 **1. Sistema de Hidratación**

**Datos del perfil que usa**:
- `water_goal` → Meta diaria de agua

**Cómo funciona**:
1. El usuario registra su consumo de agua en `hydration_records`
2. El sistema compara el total del día con `water_goal` del perfil
3. Calcula el porcentaje de cumplimiento
4. Genera alertas y recomendaciones

**Ejemplo**:
```
water_goal = 4000 ml
Consumo del día = 3200 ml
Cumplimiento = 3200 / 4000 = 80% (Good ✅)
```

**Endpoint**: `GET /api/hydration/daily-summary`

**Respuesta**:
```json
{
  "total_ml": 3200,
  "goal_ml": 4000,
  "percentage": 80,
  "status": "good",
  "message": "¡Buen progreso! Solo faltan 800 ml para alcanzar tu meta."
}
```

---

### 🍽️ **2. Sistema de Nutrición**

**Datos del perfil que usa**:
- `daily_calorie_goal` → Meta de calorías
- `protein_goal` → Meta de proteínas (g)
- `carbs_goal` → Meta de carbohidratos (g)
- `fat_goal` → Meta de grasas (g)

**Cómo funciona**:
1. El usuario registra sus comidas en `nutritional_data`
2. El sistema suma las calorías y macros del día
3. Compara con las metas del perfil
4. Genera un **sistema de semáforo** (verde, amarillo, rojo)

**Sistema de Adherencia**:
- 🟢 **Verde**: Dentro del objetivo (±100 kcal, ±15g macros)
- 🟡 **Amarillo**: Ligeramente fuera (±200 kcal, ±25g macros)
- 🔴 **Rojo**: Significativamente fuera

**Ejemplo**:
```
daily_calorie_goal = 1942 kcal
Consumo del día = 1850 kcal
Diferencia = -92 kcal → 🟢 Verde (excelente)
```

**Endpoint**: `GET /api/nutrition/daily-summary`

**Respuesta**:
```json
{
  "total_calories": 1850,
  "goal_calories": 1942,
  "total_protein": 142,
  "goal_protein": 145,
  "total_carbs": 190,
  "goal_carbs": 194,
  "total_fat": 63,
  "goal_fat": 65,
  "adherence": {
    "calories": "green",
    "protein": "green",
    "carbs": "green",
    "fat": "green"
  },
  "message": "¡Excelente día! Estás dentro de tus objetivos."
}
```

---

### 💪 **3. Sistema de Ejercicios**

**Datos del perfil que usa**:
- `activity_level` → Nivel de actividad actual
- `body_type` → Tipo de cuerpo
- `target_weight` → Meta de peso
- `bmi_category` → Categoría de IMC
- `body_fat_percentage` → % de grasa

**Cómo funciona**:
1. El sistema analiza el perfil del usuario
2. Recomienda ejercicios según:
   - Nivel de actividad (principiante, intermedio, avanzado)
   - Objetivo (perder peso, ganar músculo, mantener)
   - Tipo de cuerpo (más cardio vs más fuerza)
   - Condiciones médicas (ejercicios seguros)

**Ejemplo de lógica**:
```
Si IMC > 30 (obesidad) → Ejercicios de bajo impacto (natación, caminata)
Si body_type = "ectomorph" → Más ejercicios de fuerza, menos cardio
Si body_type = "endomorph" → Más cardio, circuitos HIIT
Si activity_level = "sedentary" → Comenzar con ejercicios suaves
```

**Endpoint**: `GET /api/exercises/recommendations`

**Respuesta**:
```json
{
  "user_profile": {
    "activity_level": "sedentary",
    "bmi_category": "overweight",
    "target": "weight_loss"
  },
  "recommendations": [
    {
      "name": "Caminata rápida",
      "duration": "30 minutos",
      "intensity": "moderate",
      "calories_burned": 150,
      "reason": "Bajo impacto, ideal para comenzar"
    },
    {
      "name": "Natación",
      "duration": "20 minutos",
      "intensity": "light",
      "calories_burned": 180,
      "reason": "No impacta las articulaciones, quema calorías"
    }
  ]
}
```

---

### 🧑‍⚕️ **4. Sistema de Coaching**

**Datos del perfil que usa**:
- `age` → Para consejos según edad
- `gender` → Para personalizar mensajes
- `bmi` y `bmi_category` → Para alertas de salud
- `target_weight` y `target_date` → Para mensajes motivacionales
- `body_type` → Para consejos metabólicos
- `medical_conditions` → Para advertencias especiales
- `dietary_restrictions` → Para recomendar alimentos seguros
- Todos los objetivos nutricionales → Para evaluar adherencia

**Cómo funciona**:
El coach analiza:
1. **Perfil completo del usuario**
2. **Historial de los últimos 7 días** (nutrición, hidratación, ejercicios)
3. **Comparación con objetivos** del perfil
4. **Contexto** (días estresantes, viajes, etc.)

Y genera:
- ✅ Mensajes motivacionales personalizados
- ✅ Consejos específicos según tipo de cuerpo
- ✅ Estrategias para alcanzar objetivos
- ✅ Advertencias si hay problemas de salud
- ✅ Ajustes recomendados

**Ejemplo de mensaje del coach**:

```
Usuario:
- Edad: 30 años, Hombre
- IMC: 25.95 (Sobrepeso)
- Objetivo: 68 kg
- body_type: "endomorph"
- Consumo promedio: 2100 kcal (meta: 1942 kcal)
- Hidratación promedio: 70%
```

**Mensaje del coach**:
```
🎯 Análisis de la Semana

Hola! Has consumido en promedio 158 kcal más de tu meta diaria.
Como tienes metabolismo endomorfo (tendencia a ganar peso fácilmente),
es importante que seas más estricto con el déficit calórico.

💡 Consejos personalizados:
- Aumenta tu consumo de proteínas para mayor saciedad
- Reduce carbohidratos simples en la cena
- Incrementa tu hidratación al 100% (actualmente 70%)
- Agrega 20 min de cardio 3 veces por semana

🎉 Lo que vas bien:
- Tu distribución de macros es excelente
- Estás siendo constante con el registro

Pequeños ajustes te llevarán a tu meta de 68 kg. ¡Tú puedes!
```

**Endpoint**: `POST /api/coaching/progress-check`

---

### 📊 **5. Sistema de Contexto y Tolerancias**

**Datos del perfil que usa**:
- Todas las metas nutricionales
- `is_medically_supervised`
- `medical_conditions`

**Cómo funciona**:
El sistema ajusta las tolerancias de adherencia según el contexto:

**Ejemplo**:
```
Día normal:
- Tolerancia calorías: ±100 kcal

Día estresante:
- Tolerancia calorías: ±250 kcal (+50%)
- Mensaje: "Está bien si hoy comes un poco más, es un día difícil"

Fin de semana:
- Tolerancia calorías: ±150 kcal (+20%)
- Mensaje: "Disfruta tu fin de semana con flexibilidad controlada"

Enfermedad:
- Tolerancia calorías: ±400 kcal (+100%)
- Mensaje: "Prioriza tu recuperación, no te preocupes tanto por las calorías"
```

**Endpoint**: `GET /api/context/tolerance`

---

### 📈 **6. Sistema de Análisis de Progreso**

**Datos del perfil que usa**:
- `weight` → Peso inicial
- `target_weight` → Peso objetivo
- `target_date` → Fecha límite
- Todas las metas nutricionales

**Cómo funciona**:
1. Compara el peso actual vs inicial
2. Calcula la velocidad de pérdida/ganancia
3. Proyecta si alcanzarás tu meta a tiempo
4. Genera gráficos de tendencias
5. Sugiere ajustes si vas muy lento o muy rápido

**Ejemplo**:
```
Peso inicial: 75 kg (hace 4 semanas)
Peso actual: 73 kg
Pérdida: 2 kg en 4 semanas = 0.5 kg/semana ✅

Peso objetivo: 68 kg
Falta: 5 kg
A este ritmo: 5 kg / 0.5 kg/semana = 10 semanas

Fecha objetivo: 8 semanas
Conclusión: Vas un poco lento, aumenta el déficit en 100 kcal/día
```

---

## 🔄 Flujo de Datos Global

```
┌─────────────────────────────────────────┐
│         USUARIO CREA PERFIL             │
│  (altura, peso, edad, género, etc.)     │
└──────────────────┬──────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│      SISTEMA CALCULA AUTOMÁTICAMENTE    │
│  • IMC y categoría                      │
│  • BMR (metabolismo basal)              │
│  • TDEE (gasto energético)              │
│  • Meta calórica ajustada               │
│  • Metas de macronutrientes             │
│  • Meta de hidratación                  │
│  • Contextura física                    │
│  • Estimación de grasa corporal         │
│  • Rango de peso ideal                  │
└──────────────────┬──────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│    PERFIL COMPLETO ALMACENADO EN BD     │
│         (tabla: user_profiles)          │
└──────┬────────┬────────┬────────┬───────┘
       │        │        │        │
       ↓        ↓        ↓        ↓
┌──────────┐ ┌───────┐ ┌───────┐ ┌──────────┐
│HIDRATACIÓN│ │NUTRICIÓN│ │EJERCICIOS│ │COACHING│
│          │ │       │ │       │ │          │
│Usa:      │ │Usa:   │ │Usa:   │ │Usa:      │
│water_goal│ │calorías│ │activity│ │TODO      │
│          │ │proteínas│ │body_type│ │EL       │
│          │ │carbs  │ │bmi    │ │PERFIL    │
│          │ │grasas │ │target │ │          │
└──────────┘ └───────┘ └───────┘ └──────────┘
       │        │        │        │
       └────────┴────────┴────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│     ANÁLISIS Y RETROALIMENTACIÓN        │
│  • Compara consumo vs metas             │
│  • Evalúa adherencia                    │
│  • Genera insights personalizados       │
│  • Sugiere ajustes                      │
│  • Motiva y guía al usuario             │
└─────────────────────────────────────────┘
```

---

## 💡 Casos de Uso Prácticos

### 🎯 **Caso 1: Usuario Nuevo - Quiere Perder Peso**

**Paso 1**: Usuario completa su perfil
```json
{
  "height": 170,
  "weight": 85,
  "age": 35,
  "gender": "male",
  "activity_level": "sedentary",
  "target_weight": 75,
  "target_date": "2025-08-12"
}
```

**Paso 2**: Sistema calcula automáticamente
```
IMC = 29.41 (Sobrepeso)
BMR = 1813 kcal
TDEE = 2176 kcal (sedentario × 1.2)
Déficit necesario = (85-75) × 7700 / 35 semanas = 2200 kcal/semana
Déficit diario = 314 kcal
Meta calórica = 2176 - 314 = 1862 kcal/día ✅
Proteínas = 140 g/día
Carbohidratos = 186 g/día
Grasas = 62 g/día
Agua = 4000 ml/día
```

**Paso 3**: Usuario comienza a registrar
- ✅ Cada comida → Se compara con 1862 kcal
- ✅ Cada vaso de agua → Se compara con 4000 ml
- ✅ Cada ejercicio → Se suma al déficit calórico
- ✅ Cada semana → El coach analiza y motiva

**Resultado**: Sistema completamente personalizado a sus necesidades.

---

### 🎯 **Caso 2: Usuario con Condiciones Médicas**

**Paso 1**: Usuario completa perfil con restricciones
```json
{
  "height": 165,
  "weight": 68,
  "age": 45,
  "gender": "female",
  "activity_level": "light",
  "medical_conditions": "Diabetes tipo 2, hipertensión",
  "dietary_restrictions": "Bajo en sodio, control de carbohidratos",
  "is_medically_supervised": true
}
```

**Paso 2**: Sistema adapta recomendaciones
- ⚠️ Limita los carbohidratos (ajusta distribución a 30%)
- ⚠️ Alerta sobre alimentos altos en sodio
- ⚠️ No permite déficits calóricos agresivos
- ⚠️ El coach recomienda alimentos de bajo índice glucémico

**Paso 3**: Cuando usuario registra comidas
```
Comida con mucho sodio → ⚠️ "Cuidado, esta comida tiene 1200mg de sodio"
Comida con muchos carbohidratos simples → ⚠️ "Como tienes diabetes,
prefiere carbohidratos complejos"
```

---

### 🎯 **Caso 3: Atleta - Ganar Masa Muscular**

**Paso 1**: Usuario completa perfil
```json
{
  "height": 180,
  "weight": 75,
  "age": 25,
  "gender": "male",
  "activity_level": "very_active",
  "body_type": "ectomorph",
  "target_weight": 82,
  "muscle_mass_percentage": 48
}
```

**Paso 2**: Sistema calcula para ganancia muscular
```
BMR = 1848 kcal
TDEE = 3511 kcal (muy activo × 1.9)
Superávit necesario = +300 kcal (ganancia lenta y limpia)
Meta calórica = 3811 kcal/día
Proteínas = 286 g/día (mucha proteína para ganar músculo)
Carbohidratos = 476 g/día (energía para entrenar)
Grasas = 127 g/día
```

**Paso 3**: Coach personalizado
```
"Como eres ectomorfo, tu metabolismo es muy rápido.
Necesitas comer más de lo que crees. Prioriza:
- 6 comidas al día
- Batidos de proteína post-entreno
- Carbohidratos complejos en cada comida
- Ejercicios de fuerza 4-5 veces por semana"
```

---

## 📱 Endpoints para Trabajar con el Perfil

### Crear/Actualizar Perfil
```bash
POST /api/profile
```

### Obtener Perfil Completo
```bash
GET /api/profile
```

### Actualizar Campos Específicos
```bash
PUT /api/profile
```

---

## ✅ Checklist para el Usuario

Para que el sistema funcione al **100%**, el usuario debe proporcionar:

**Mínimo Indispensable** ✅:
- [x] Altura
- [x] Peso
- [x] Edad
- [x] Género
- [x] Nivel de actividad

**Recomendado para Mejor Precisión** 📈:
- [x] Peso objetivo
- [x] Fecha objetivo
- [x] Circunferencia de muñeca
- [x] Tipo de cuerpo

**Opcional pero Útil** 💡:
- [ ] Circunferencias (cintura, cadera, cuello)
- [ ] Porcentaje de grasa corporal
- [ ] Porcentaje de masa muscular
- [ ] Condiciones médicas
- [ ] Restricciones dietéticas

---

## 🎓 Conclusión

El **Perfil de Usuario** es el **núcleo del sistema NutriCoach**. Sin él, el sistema no puede:
- ❌ Calcular metas personalizadas
- ❌ Evaluar adherencia
- ❌ Generar consejos útiles
- ❌ Seguir el progreso
- ❌ Motivar al usuario

Con un perfil completo, el sistema se convierte en un **coach nutricional personalizado** que:
- ✅ Conoce tu cuerpo
- ✅ Entiende tus objetivos
- ✅ Respeta tus limitaciones
- ✅ Celebra tus logros
- ✅ Te guía hacia el éxito

**El perfil es la diferencia entre una app genérica y un coach personal digital.**

---

**Fecha**: 2025-11-12
**Versión**: 1.0.0
**Sistema**: NutriCoach Backend
