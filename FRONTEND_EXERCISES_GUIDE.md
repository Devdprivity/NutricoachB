# Guía para el Frontend - Sistema de Ejercicios

## 🎯 Resumen Ejecutivo

El backend ya tiene un sistema completo de ejercicios que:
- **Recomienda ejercicios** basados en calorías que quieres quemar
- **Evita fatiga muscular** (no recomienda músculos trabajados en <48 horas)
- **Calcula automáticamente** el tiempo necesario para quemar X calorías
- **Guarda historial** de ejercicios completados
- **Muestra estadísticas** diarias y semanales

## 📱 Flujo Completo en la App Móvil

### 1. Pantalla Principal de Ejercicios

**Lo que el usuario ve:**
- Input para ingresar calorías que quiere quemar (ej: 300)
- Botón "Buscar Ejercicios"

**Código React Native:**

```typescript
import { useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';

function ExerciseScreen() {
  const [calories, setCalories] = useState('300');
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);

    const token = await AsyncStorage.getItem('auth_token');

    const response = await fetch(
      `https://nutricoachb-main-2vd5yx.laravel.cloud/api/exercises/recommendations?calories_to_burn=${calories}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      }
    );

    const data = await response.json();
    setExercises(data.recommended_exercises);
    setLoading(false);
  };

  return (
    <View>
      <Text>¿Cuántas calorías quieres quemar?</Text>

      <TextInput
        value={calories}
        onChangeText={setCalories}
        keyboardType="numeric"
        placeholder="300"
      />

      <Button
        title="Buscar Ejercicios"
        onPress={fetchRecommendations}
        disabled={loading}
      />

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ExerciseCard exercise={item} />
        )}
      />
    </View>
  );
}
```

---

### 2. Card de Ejercicio (Componente)

**Lo que el usuario ve:**
- Nombre del ejercicio
- Tipo y dificultad
- Músculo trabajado
- Tiempo recomendado
- Calorías estimadas
- Botón "Ver Detalles"

**Código:**

```typescript
interface Exercise {
  id: number;
  name: string;
  type: string;
  muscle: string;
  difficulty: string;
  equipment: string;
  calories_per_minute: number;
  recommended_duration_minutes: number;
  estimated_calories_burned: number;
  instructions: string;
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const navigation = useNavigation();

  return (
    <View style={styles.card}>
      {/* Título */}
      <Text style={styles.title}>{exercise.name}</Text>

      {/* Info rápida */}
      <View style={styles.tags}>
        <Text style={styles.tag}>
          🏃 {exercise.type}
        </Text>
        <Text style={styles.tag}>
          💪 {exercise.muscle}
        </Text>
        <Text style={styles.tag}>
          ⭐ {exercise.difficulty}
        </Text>
      </View>

      {/* Equipo necesario */}
      {exercise.equipment && (
        <Text style={styles.equipment}>
          🔧 Necesitas: {exercise.equipment}
        </Text>
      )}

      {/* Duración y calorías */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Tiempo</Text>
          <Text style={styles.statValue}>
            {exercise.recommended_duration_minutes} min
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statLabel}>Calorías</Text>
          <Text style={styles.statValue}>
            {exercise.estimated_calories_burned} kcal
          </Text>
        </View>
      </View>

      {/* Botón de acción */}
      <Button
        title="Ver Instrucciones"
        onPress={() => navigation.navigate('ExerciseDetail', { exercise })}
      />
    </View>
  );
}
```

---

### 3. Pantalla de Detalle del Ejercicio

**Lo que el usuario ve:**
- Nombre del ejercicio
- Instrucciones completas paso a paso
- Tiempo recomendado
- Botón "Empezar Ejercicio"
- Temporizador (opcional)

**Código:**

```typescript
function ExerciseDetailScreen({ route }) {
  const { exercise } = route.params;
  const [isExercising, setIsExercising] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Función para completar el ejercicio
  const completeExercise = async (durationMinutes: number) => {
    const token = await AsyncStorage.getItem('auth_token');

    const response = await fetch(
      'https://nutricoachb-main-2vd5yx.laravel.cloud/api/exercises/log',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exercise_id: exercise.id,
          duration_minutes: durationMinutes,
          notes: 'Completado desde la app',
        })
      }
    );

    const data = await response.json();

    if (response.ok) {
      Alert.alert(
        '¡Excelente!',
        `Has quemado ${data.calories_burned} calorías 🔥`,
        [
          {
            text: 'Ver Resumen',
            onPress: () => navigation.navigate('ExerciseSummary')
          },
          { text: 'OK' }
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{exercise.name}</Text>

        <View style={styles.badges}>
          <Badge text={exercise.type} />
          <Badge text={exercise.difficulty} />
          <Badge text={exercise.muscle} />
        </View>
      </View>

      {/* Imagen (si existe) */}
      {exercise.image_url && (
        <Image
          source={{ uri: exercise.image_url }}
          style={styles.image}
        />
      )}

      {/* Información clave */}
      <View style={styles.infoBox}>
        <InfoItem
          icon="⏱️"
          label="Duración recomendada"
          value={`${exercise.recommended_duration_minutes} minutos`}
        />
        <InfoItem
          icon="🔥"
          label="Calorías estimadas"
          value={`${exercise.estimated_calories_burned} kcal`}
        />
        <InfoItem
          icon="💪"
          label="Grupo muscular"
          value={exercise.muscle}
        />
        {exercise.equipment && (
          <InfoItem
            icon="🔧"
            label="Equipo"
            value={exercise.equipment}
          />
        )}
      </View>

      {/* Instrucciones */}
      <View style={styles.instructions}>
        <Text style={styles.sectionTitle}>Instrucciones</Text>
        <Text style={styles.instructionText}>
          {exercise.instructions}
        </Text>
      </View>

      {/* Botón de acción */}
      {!isExercising ? (
        <Button
          title="Empezar Ejercicio"
          onPress={() => setIsExercising(true)}
        />
      ) : (
        <View>
          <Text style={styles.timer}>
            {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
          </Text>

          <Button
            title="Terminar y Guardar"
            onPress={() => {
              const minutes = Math.ceil(elapsedTime / 60);
              completeExercise(minutes);
            }}
          />
        </View>
      )}
    </ScrollView>
  );
}
```

---

### 4. Pantalla de Resumen Diario

**Lo que el usuario ve:**
- Total de ejercicios completados hoy
- Total de calorías quemadas
- Total de tiempo de ejercicio
- Lista de ejercicios realizados

**Código:**

```typescript
function ExerciseSummaryScreen() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    const token = await AsyncStorage.getItem('auth_token');

    const response = await fetch(
      'https://nutricoachb-main-2vd5yx.laravel.cloud/api/exercises/summary',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      }
    );

    const data = await response.json();
    setSummary(data);
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumen de Hoy</Text>

      {/* Estadísticas principales */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="🏃"
          value={summary.total_exercises}
          label="Ejercicios"
        />
        <StatCard
          icon="🔥"
          value={summary.total_calories_burned}
          label="Calorías"
        />
        <StatCard
          icon="⏱️"
          value={summary.total_duration_minutes}
          label="Minutos"
        />
      </View>

      {/* Lista de ejercicios */}
      <Text style={styles.subtitle}>Ejercicios Realizados</Text>

      <FlatList
        data={summary.exercises}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.exerciseItem}>
            <Text style={styles.exerciseName}>
              {item.exercise.name}
            </Text>
            <Text style={styles.exerciseInfo}>
              {item.duration_minutes} min • {item.calories_burned} kcal
            </Text>
          </View>
        )}
      />
    </View>
  );
}
```

---

### 5. Pantalla de Estado de Músculos (Opcional pero Útil)

**Lo que el usuario ve:**
- Lista de grupos musculares
- Estado: Descansado ✅ o Fatigado ⚠️
- Días desde que se trabajó

**Código:**

```typescript
function MuscleStatusScreen() {
  const [muscleStatus, setMuscleStatus] = useState([]);

  useEffect(() => {
    fetchMuscleStatus();
  }, []);

  const fetchMuscleStatus = async () => {
    const token = await AsyncStorage.getItem('auth_token');

    const response = await fetch(
      'https://nutricoachb-main-2vd5yx.laravel.cloud/api/exercises/muscle-status',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      }
    );

    const data = await response.json();
    setMuscleStatus(data.muscle_status);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estado de Músculos</Text>

      <Text style={styles.subtitle}>
        Descansados: {muscleStatus.filter(m => m.status === 'rested').length}
      </Text>

      <FlatList
        data={muscleStatus}
        keyExtractor={(item) => item.muscle}
        renderItem={({ item }) => (
          <View style={styles.muscleItem}>
            <Text style={styles.muscleName}>
              {item.muscle}
            </Text>

            <View style={styles.muscleStatus}>
              {item.status === 'rested' ? (
                <>
                  <Text style={styles.statusBadgeRested}>✅ Descansado</Text>
                  {item.days_since_worked && (
                    <Text style={styles.statusInfo}>
                      Hace {item.days_since_worked} días
                    </Text>
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.statusBadgeFatigued}>⚠️ Fatigado</Text>
                  <Text style={styles.statusInfo}>
                    Trabajado hace {item.days_since_worked} día(s)
                  </Text>
                </>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}
```

---

## 🔥 Ejemplo de Flujo Completo

### Paso 1: Usuario quiere quemar 300 calorías

```typescript
// App llama a:
GET /api/exercises/recommendations?calories_to_burn=300

// Backend responde con ejercicios recomendados, ejemplo:
{
  "recommended_exercises": [
    {
      "id": 15,
      "name": "Running",
      "type": "cardio",
      "muscle": "quadriceps",
      "difficulty": "beginner",
      "equipment": "none",
      "instructions": "Start running at a moderate pace...",
      "recommended_duration_minutes": 30,
      "estimated_calories_burned": 300
    }
  ]
}
```

### Paso 2: Usuario selecciona "Running" y ve las instrucciones

```typescript
// App muestra:
// - Nombre: Running
// - Tipo: cardio
// - Músculo: quadriceps
// - Duración: 30 minutos
// - Instrucciones completas
// - Botón "Empezar"
```

### Paso 3: Usuario completa el ejercicio

```typescript
// App llama a:
POST /api/exercises/log
{
  "exercise_id": 15,
  "duration_minutes": 30
}

// Backend responde:
{
  "message": "Exercise logged successfully",
  "calories_burned": 300
}
```

### Paso 4: Backend automáticamente marca "quadriceps" como fatigado

```typescript
// Ahora por 48 horas:
// - Las recomendaciones NO incluirán ejercicios de piernas
// - Recomendará brazos, pecho, espalda, etc.
```

### Paso 5: Usuario ve su resumen del día

```typescript
// App llama a:
GET /api/exercises/summary

// Backend responde:
{
  "date": "2025-10-14",
  "total_exercises": 1,
  "total_calories_burned": 300,
  "total_duration_minutes": 30,
  "exercises": [...]
}
```

---

## 📊 Datos que Recibes del Backend

### Objeto Exercise completo:

```typescript
interface Exercise {
  id: number;
  name: string;                          // Ej: "Dumbbell Curl"
  type: string;                          // cardio, strength, etc.
  muscle: string;                        // biceps, chest, quadriceps, etc.
  equipment: string | null;              // dumbbell, barbell, none, etc.
  difficulty: string;                    // beginner, intermediate, expert
  instructions: string;                  // Instrucciones paso a paso
  image_url: string | null;              // URL de imagen (puede ser null)
  calories_per_minute: number;           // Estimación base
  recommended_duration_minutes: number;  // Tiempo calculado
  estimated_calories_burned: number;     // Total estimado
  muscle_is_rested: boolean;            // Si el músculo está descansado
}
```

### Resumen diario:

```typescript
interface Summary {
  date: string;                      // "2025-10-14"
  total_exercises: number;           // 3
  total_calories_burned: number;     // 450
  total_duration_minutes: number;    // 90
  exercises: UserExercise[];         // Array de ejercicios completados
}
```

### Estado de músculos:

```typescript
interface MuscleStatus {
  muscle: string;                    // "biceps"
  status: 'rested' | 'fatigued';    // Estado
  days_since_worked: number | null;  // 1, 2, 3, etc.
  last_worked_date: string | null;   // "2025-10-14"
  intensity_level: number;           // 1-5
}
```

---

## 🎨 Sugerencias de UI/UX

### Pantalla de Recomendaciones:
- Input grande para calorías
- Filtros opcionales: dificultad, tipo
- Cards con gradientes por tipo de ejercicio
- Badge verde "Músculo descansado ✅"

### Pantalla de Detalle:
- Hero image (o placeholder por tipo)
- Instrucciones en steps numerados
- Timer circular animado
- Botón grande "Empezar" / "Terminar"

### Pantalla de Resumen:
- Gráfico circular de calorías
- Timeline de ejercicios del día
- Badges de logros (ej: "¡300 calorías! 🔥")

### Estado de Músculos:
- Lista con iconos de músculos
- Color verde para descansados
- Color naranja para fatigados
- Tooltip: "Descansa 1 día más"

---

## ⚠️ Notas Importantes

### 1. Imágenes
El campo `image_url` puede ser `null`. Opciones:

**Opción A: Placeholder por tipo**
```typescript
function getExerciseImage(exercise: Exercise) {
  if (exercise.image_url) {
    return { uri: exercise.image_url };
  }

  const placeholders = {
    'cardio': require('./assets/cardio.png'),
    'strength': require('./assets/strength.png'),
    'stretching': require('./assets/stretching.png'),
  };

  return placeholders[exercise.type] || require('./assets/default.png');
}
```

**Opción B: Sin imagen**
```typescript
// Simplemente no mostrar imagen si es null
{exercise.image_url && (
  <Image source={{ uri: exercise.image_url }} />
)}
```

### 2. Sincronización Inicial

La primera vez que uses el sistema, necesitas sincronizar ejercicios:

```typescript
// Hacer esto una vez al instalar la app o en settings
const syncExercises = async () => {
  const token = await AsyncStorage.getItem('auth_token');

  await fetch(
    'https://nutricoachb-main-2vd5yx.laravel.cloud/api/exercises/sync',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    }
  );

  Alert.alert('¡Listo!', 'Base de ejercicios sincronizada');
};
```

**Importante:** Esto solo se hace UNA VEZ. Los ejercicios quedan guardados en la base de datos del backend.

### 3. Manejo de Errores

```typescript
const fetchRecommendations = async () => {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error('Error al obtener ejercicios');
    }

    const data = await response.json();

    if (data.total_exercises === 0) {
      Alert.alert(
        'Sin opciones',
        'Todos tus músculos están fatigados. Descansa hoy o busca ejercicios manualmente.'
      );
    }

    return data;
  } catch (error) {
    Alert.alert('Error', 'No se pudieron cargar los ejercicios');
    console.error(error);
  }
};
```

---

## 🚀 Checklist de Implementación

### Fase 1 - MVP:
- [ ] Pantalla de recomendaciones con input de calorías
- [ ] Card de ejercicio con info básica
- [ ] Pantalla de detalle con instrucciones
- [ ] Botón para completar ejercicio
- [ ] Llamada a `/api/exercises/log`

### Fase 2 - Mejoras:
- [ ] Pantalla de resumen diario
- [ ] Historial de ejercicios
- [ ] Timer durante el ejercicio
- [ ] Animaciones y feedback

### Fase 3 - Avanzado:
- [ ] Estado de músculos
- [ ] Filtros avanzados
- [ ] Estadísticas semanales
- [ ] Gráficos de progreso

---

## 📞 Resumen Ultra Rápido

**1. Pedir recomendaciones:**
```typescript
GET /api/exercises/recommendations?calories_to_burn=300
```

**2. Mostrar ejercicios al usuario**

**3. Cuando complete uno:**
```typescript
POST /api/exercises/log
{
  "exercise_id": 15,
  "duration_minutes": 30
}
```

**4. Mostrar resumen:**
```typescript
GET /api/exercises/summary
```

**Eso es todo. El backend hace todo lo demás automáticamente.**

---

¿Alguna duda específica sobre cómo implementar algo?
