# API de Composición Corporal - NutriCoach

## Nuevas Funcionalidades Implementadas

### 📊 Campos Agregados a `user_profiles`

#### Contextura y Tipo de Cuerpo
- **body_frame** (enum): `small`, `medium`, `large`
  - Contextura física basada en estructura ósea
- **body_type** (enum): `ectomorph`, `mesomorph`, `endomorph`
  - Somatotipo del usuario

#### Circunferencias Corporales
- **wrist_circumference** (decimal): Circunferencia de muñeca en cm (10-30 cm)
- **waist_circumference** (decimal): Circunferencia de cintura en cm (40-200 cm)
- **hip_circumference** (decimal): Circunferencia de cadera en cm (50-200 cm)
- **neck_circumference** (decimal): Circunferencia de cuello en cm (20-60 cm)

#### Composición Corporal
- **body_fat_percentage** (decimal): Porcentaje de grasa corporal (3-60%)
- **muscle_mass_percentage** (decimal): Porcentaje de masa muscular (20-70%)

---

## 🔬 Cálculos Automáticos

### 1. Contextura Física Automática
**Método**: `calculateBodyFrame()`

Calcula la contextura física basándose en la relación altura/circunferencia de muñeca (r-value):

```
r-value = altura (cm) / circunferencia muñeca (cm)
```

**Rangos para Hombres**:
- r-value > 10.4 → **small** (delgada)
- r-value 9.6 - 10.4 → **medium** (media)
- r-value < 9.6 → **large** (robusta)

**Rangos para Mujeres**:
- r-value > 11.0 → **small** (delgada)
- r-value 10.1 - 11.0 → **medium** (media)
- r-value < 10.1 → **large** (robusta)

---

### 2. Estimación de Grasa Corporal
**Método**: `estimateBodyFat()`

Utiliza el **Método US Navy** para estimar el porcentaje de grasa corporal:

**Para Hombres**:
```
Requiere: cintura, cuello, altura
BF% = 495 / (1.0324 - 0.19077 × log10(cintura - cuello) + 0.15456 × log10(altura)) - 450
```

**Para Mujeres**:
```
Requiere: cintura, cadera, cuello, altura
BF% = 495 / (1.29579 - 0.35004 × log10(cintura + cadera - cuello) + 0.22100 × log10(altura)) - 450
```

**Categorías de Grasa Corporal**:

| Categoría | Hombres | Mujeres |
|-----------|---------|---------|
| Essential | < 6% | < 14% |
| Athletes | 6-13% | 14-20% |
| Fitness | 14-17% | 21-24% |
| Average | 18-24% | 25-31% |
| Obese | ≥ 25% | ≥ 32% |

---

### 3. Ratio Cintura/Cadera (WHR)
**Atributo**: `waist_to_hip_ratio`

Calcula el ratio cintura/cadera para evaluar riesgo de salud:

```
WHR = cintura / cadera
```

**Categorías de Riesgo**:

| Riesgo | Hombres | Mujeres |
|--------|---------|---------|
| Bajo | < 0.90 | < 0.80 |
| Moderado | 0.90-0.99 | 0.80-0.85 |
| Alto | ≥ 1.00 | ≥ 0.86 |

---

### 4. Rango de Peso Ideal
**Método**: `getIdealWeightRange()`

Calcula el rango de peso ideal usando la **Fórmula de Devine**, ajustada por contextura física:

**Fórmula Base**:
- Hombres: `50 + 2.3 × (altura_en_pulgadas - 60)`
- Mujeres: `45.5 + 2.3 × (altura_en_pulgadas - 60)`

**Ajuste por Contextura**:
- **Small**: -10% a 0%
- **Medium**: -5% a +5%
- **Large**: 0% a +10%

---

## 🔌 Endpoints API

### GET `/api/profile`
Obtiene el perfil completo del usuario autenticado.

**Respuesta**:
```json
{
  "message": "Perfil obtenido exitosamente",
  "data": {
    "profile": { ... },
    "bmi": 24.5,
    "bmi_category": "normal",
    "bmr": 1650,
    "tdee": 2280,
    "body_composition": {
      "body_frame": "medium",
      "body_frame_description": "Contextura media - estructura ósea promedio",
      "body_type": "mesomorph",
      "body_type_description": "Mesomorfo - estructura atlética, gana músculo fácilmente",
      "body_fat_percentage": 18.5,
      "body_fat_category": "average",
      "waist_to_hip_ratio": 0.85,
      "whr_category": "low_risk",
      "ideal_weight_range": {
        "min": 65.5,
        "max": 72.5,
        "frame": "medium"
      }
    }
  }
}
```

---

### POST `/api/profile`
Crea o actualiza el perfil del usuario.

**Body**:
```json
{
  "height": 170,
  "weight": 70,
  "age": 30,
  "gender": "male",
  "activity_level": "moderate",
  "body_frame": "medium",
  "body_type": "mesomorph",
  "wrist_circumference": 17.5,
  "waist_circumference": 85,
  "hip_circumference": 95,
  "neck_circumference": 38,
  "body_fat_percentage": 18,
  "muscle_mass_percentage": 45,
  "target_weight": 68,
  "target_date": "2025-06-01"
}
```

**Campos Requeridos**:
- height, weight, age, gender, activity_level

**Campos Opcionales**:
- body_frame, body_type
- wrist_circumference, waist_circumference, hip_circumference, neck_circumference
- body_fat_percentage, muscle_mass_percentage
- target_weight, target_date
- medical_conditions, dietary_restrictions, is_medically_supervised

---

### PUT `/api/profile`
Actualiza campos específicos del perfil.

**Body** (todos los campos son opcionales):
```json
{
  "wrist_circumference": 17.5,
  "waist_circumference": 85,
  "body_type": "mesomorph"
}
```

---

## 🎯 Casos de Uso

### Caso 1: Cálculo Automático de Contextura
Si el usuario proporciona la **circunferencia de muñeca** y la **altura**, el sistema calcula automáticamente la contextura:

```json
POST /api/profile
{
  "height": 170,
  "weight": 70,
  "age": 30,
  "gender": "male",
  "activity_level": "moderate",
  "wrist_circumference": 17.5
}
```

**Resultado**:
- El sistema calcula: `r-value = 170 / 17.5 = 9.71`
- Como 9.6 ≤ 9.71 ≤ 10.4 → `body_frame = "medium"`

---

### Caso 2: Estimación de Grasa Corporal
Si el usuario proporciona **cintura**, **cuello** (y **cadera** para mujeres) con **altura**, el sistema estima la grasa corporal:

```json
POST /api/profile
{
  "height": 170,
  "weight": 70,
  "age": 30,
  "gender": "male",
  "activity_level": "moderate",
  "waist_circumference": 85,
  "neck_circumference": 38
}
```

**Resultado**:
- El sistema calcula usando la fórmula US Navy
- Retorna el porcentaje estimado y la categoría (essential, athletes, fitness, average, obese)

---

### Caso 3: Rango de Peso Ideal Personalizado
Con **altura** y **contextura** (manual o calculada), el sistema proporciona un rango de peso ideal personalizado:

```json
GET /api/profile
```

**Respuesta incluye**:
```json
"ideal_weight_range": {
  "min": 65.5,
  "max": 72.5,
  "frame": "medium"
}
```

---

## 📱 Tipos de Cuerpo

### Ectomorph (Ectomorfo)
- Metabolismo rápido
- Dificulta ganar peso y músculo
- Estructura delgada y alargada
- **Recomendación**: Mayor ingesta calórica, entrenamiento de fuerza

### Mesomorph (Mesomorfo)
- Estructura atlética natural
- Gana músculo fácilmente
- Metabolismo equilibrado
- **Recomendación**: Balance entre cardio y fuerza

### Endomorph (Endomorfo)
- Metabolismo lento
- Tendencia a ganar peso
- Estructura más robusta
- **Recomendación**: Mayor control calórico, más cardio

---

## 💡 Ventajas del Sistema

1. **Cálculos Automáticos**: Si el usuario proporciona circunferencias, el sistema calcula automáticamente la contextura y grasa corporal
2. **Personalización**: Los rangos de peso ideal se ajustan según la contextura individual
3. **Flexibilidad**: El usuario puede proporcionar valores manuales o dejar que el sistema los calcule
4. **Precisión**: Usa fórmulas científicamente validadas (Devine, US Navy)
5. **Evaluación de Riesgo**: El WHR proporciona indicadores de riesgo cardiovascular

---

## 🔍 Validaciones

### Circunferencias
- **Muñeca**: 10-30 cm
- **Cintura**: 40-200 cm
- **Cadera**: 50-200 cm
- **Cuello**: 20-60 cm

### Porcentajes
- **Grasa Corporal**: 3-60%
- **Masa Muscular**: 20-70%

### Enums
- **body_frame**: `small`, `medium`, `large`
- **body_type**: `ectomorph`, `mesomorph`, `endomorph`

---

## 📊 Ejemplo Completo

```bash
# Crear perfil con todos los datos de composición corporal
curl -X POST http://localhost:8000/api/profile \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "height": 175,
    "weight": 75,
    "age": 28,
    "gender": "male",
    "activity_level": "active",
    "wrist_circumference": 18,
    "waist_circumference": 82,
    "hip_circumference": 98,
    "neck_circumference": 39,
    "body_type": "mesomorph",
    "target_weight": 72
  }'
```

**Respuesta**:
```json
{
  "message": "Perfil guardado exitosamente",
  "data": {
    "profile": {
      "height": 175,
      "weight": 75,
      "age": 28,
      "gender": "male",
      "activity_level": "active",
      "body_frame": null,
      "body_type": "mesomorph",
      "wrist_circumference": 18,
      "waist_circumference": 82,
      "hip_circumference": 98,
      "neck_circumference": 39
    },
    "bmi": 24.49,
    "bmi_category": "normal",
    "bmr": 1726,
    "tdee": 2978,
    "body_composition": {
      "body_frame": "medium",
      "body_frame_description": "Contextura media - estructura ósea promedio",
      "body_type": "mesomorph",
      "body_type_description": "Mesomorfo - estructura atlética, gana músculo fácilmente",
      "body_fat_percentage": 14.2,
      "body_fat_category": "athletes",
      "waist_to_hip_ratio": 0.84,
      "whr_category": "low_risk",
      "ideal_weight_range": {
        "min": 68.5,
        "max": 75.8,
        "frame": "medium"
      }
    },
    "calculated_goals": {
      "calories": 2800,
      "protein": 210,
      "carbs": 280,
      "fat": 93
    }
  }
}
```

---

## 📚 Referencias Científicas

1. **Fórmula de Devine** (1974): Cálculo de peso ideal
2. **Método US Navy**: Estimación de grasa corporal
3. **r-value**: Método para determinar contextura física
4. **WHR (Waist-to-Hip Ratio)**: Indicador de riesgo cardiovascular establecido por la OMS

---

## ✅ Checklist de Implementación

- ✅ Migración de base de datos
- ✅ Modelo UserProfile actualizado
- ✅ Cálculo automático de contextura física
- ✅ Estimación de grasa corporal (US Navy)
- ✅ Cálculo de WHR
- ✅ Rango de peso ideal personalizado
- ✅ Validaciones en controlador
- ✅ Endpoints actualizados
- ✅ Documentación completa

---

**Fecha de implementación**: 2025-11-12
**Versión**: 1.0.0
