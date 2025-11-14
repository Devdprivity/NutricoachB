<?php

namespace Database\Seeders;

use App\Models\Exercise;
use Illuminate\Database\Seeder;

class ExerciseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $exercises = [
            // CARDIO
            [
                'name' => 'Correr/Running',
                'description' => 'Ejercicio cardiovascular fundamental que mejora la resistencia y quema calorías efectivamente',
                'category' => 'cardio',
                'difficulty' => 'beginner',
                'calories_per_minute' => 12.0,
                'image_url' => 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
                'video_url' => 'https://www.youtube.com/watch?v=_kGESn8ArrU',
                'muscles_worked' => 'Piernas, Glúteos, Core',
                'instructions' => '1. Comienza con un calentamiento caminando 5 minutos\n2. Aumenta gradualmente la velocidad hasta un trote cómodo\n3. Mantén una postura erguida\n4. Respira rítmicamente (inhala por nariz, exhala por boca)\n5. Termina con 5 minutos de enfriamiento caminando',
                'equipment' => 'Zapatillas deportivas',
                'duration_minutes' => 30,
            ],
            [
                'name' => 'Saltos de Tijera/Jumping Jacks',
                'description' => 'Ejercicio de cuerpo completo excelente para calentamiento y quema rápida de calorías',
                'category' => 'cardio',
                'difficulty' => 'beginner',
                'calories_per_minute' => 10.0,
                'image_url' => 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
                'video_url' => 'https://www.youtube.com/watch?v=iSSAk4XCsRA',
                'muscles_worked' => 'Piernas, Hombros, Core',
                'instructions' => '1. Párate con pies juntos y brazos a los lados\n2. Salta separando las piernas y levantando los brazos sobre la cabeza\n3. Regresa a la posición inicial saltando\n4. Mantén un ritmo constante\n5. Repite durante el tiempo deseado',
                'equipment' => 'Ninguno',
                'duration_minutes' => 10,
            ],
            [
                'name' => 'Burpees',
                'description' => 'Ejercicio de alta intensidad que trabaja todo el cuerpo y acelera el metabolismo',
                'category' => 'cardio',
                'difficulty' => 'advanced',
                'calories_per_minute' => 15.0,
                'image_url' => 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800',
                'video_url' => 'https://www.youtube.com/watch?v=TU8QYVW0gDU',
                'muscles_worked' => 'Pecho, Brazos, Piernas, Core',
                'instructions' => '1. Comienza de pie\n2. Baja a cuclillas y coloca las manos en el suelo\n3. Salta con los pies hacia atrás a posición de plancha\n4. Haz una flexión (opcional para principiantes)\n5. Salta con los pies hacia adelante\n6. Salta explosivamente hacia arriba\n7. Repite',
                'equipment' => 'Ninguno',
                'duration_minutes' => 15,
            ],

            // STRENGTH - PECHO
            [
                'name' => 'Flexiones/Push-ups',
                'description' => 'Ejercicio clásico de fuerza que trabaja pecho, hombros y tríceps',
                'category' => 'strength',
                'difficulty' => 'beginner',
                'calories_per_minute' => 8.0,
                'image_url' => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
                'video_url' => 'https://www.youtube.com/watch?v=IODxDxX7oi4',
                'muscles_worked' => 'Pecho, Tríceps, Hombros, Core',
                'instructions' => '1. Posición de plancha con manos separadas al ancho de hombros\n2. Cuerpo recto de cabeza a talones\n3. Baja el pecho hasta casi tocar el suelo\n4. Mantén los codos cerca del cuerpo\n5. Empuja hacia arriba hasta extender los brazos\n6. Mantén el core activado todo el tiempo',
                'equipment' => 'Ninguno',
                'duration_minutes' => 15,
            ],

            // STRENGTH - PIERNAS
            [
                'name' => 'Sentadillas/Squats',
                'description' => 'Ejercicio fundamental para piernas y glúteos que fortalece la parte inferior del cuerpo',
                'category' => 'strength',
                'difficulty' => 'beginner',
                'calories_per_minute' => 8.0,
                'image_url' => 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800',
                'video_url' => 'https://www.youtube.com/watch?v=aclHkVaku9U',
                'muscles_worked' => 'Cuádriceps, Glúteos, Isquiotibiales',
                'instructions' => '1. Párate con pies separados al ancho de hombros\n2. Mantén el pecho erguido y la mirada al frente\n3. Baja las caderas hacia atrás y abajo como si te sentaras\n4. Llega hasta que los muslos estén paralelos al suelo\n5. Mantén el peso en los talones\n6. Empuja a través de los talones para subir',
                'equipment' => 'Ninguno (puede agregar pesas)',
                'duration_minutes' => 20,
            ],
            [
                'name' => 'Zancadas/Lunges',
                'description' => 'Ejercicio unilateral que mejora el equilibrio y fortalece piernas individualmente',
                'category' => 'strength',
                'difficulty' => 'beginner',
                'calories_per_minute' => 7.0,
                'image_url' => 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800',
                'video_url' => 'https://www.youtube.com/watch?v=QOVaHwm-Q6U',
                'muscles_worked' => 'Cuádriceps, Glúteos, Isquiotibiales',
                'instructions' => '1. Párate erguido con pies juntos\n2. Da un paso largo hacia adelante\n3. Baja la cadera hasta que ambas rodillas estén a 90 grados\n4. La rodilla trasera debe casi tocar el suelo\n5. Empuja con el pie delantero para volver al inicio\n6. Alterna las piernas',
                'equipment' => 'Ninguno (puede agregar mancuernas)',
                'duration_minutes' => 15,
            ],

            // STRENGTH - CORE
            [
                'name' => 'Plancha/Plank',
                'description' => 'Ejercicio isométrico excelente para fortalecer el core y mejorar la estabilidad',
                'category' => 'strength',
                'difficulty' => 'beginner',
                'calories_per_minute' => 5.0,
                'image_url' => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
                'video_url' => 'https://www.youtube.com/watch?v=ASdvN_XEl_c',
                'muscles_worked' => 'Core, Hombros, Glúteos',
                'instructions' => '1. Apóyate en antebrazos y puntas de los pies\n2. Codos directamente debajo de los hombros\n3. Mantén el cuerpo en línea recta\n4. No dejes caer las caderas\n5. Contrae el abdomen y glúteos\n6. Respira normalmente\n7. Mantén la posición',
                'equipment' => 'Ninguno (colchoneta opcional)',
                'duration_minutes' => 10,
            ],
            [
                'name' => 'Abdominales/Crunches',
                'description' => 'Ejercicio clásico para fortalecer los músculos abdominales',
                'category' => 'strength',
                'difficulty' => 'beginner',
                'calories_per_minute' => 4.0,
                'image_url' => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
                'video_url' => 'https://www.youtube.com/watch?v=Xyd_fa5zoEU',
                'muscles_worked' => 'Abdominales superiores',
                'instructions' => '1. Acuéstate boca arriba con rodillas dobladas\n2. Pies planos en el suelo\n3. Manos detrás de la cabeza o cruzadas en el pecho\n4. Levanta los hombros del suelo usando los abdominales\n5. No tires del cuello\n6. Baja con control\n7. Repite',
                'equipment' => 'Ninguno (colchoneta opcional)',
                'duration_minutes' => 10,
            ],

            // STRENGTH - BRAZOS
            [
                'name' => 'Curl de Bíceps/Bicep Curls',
                'description' => 'Ejercicio aislado para desarrollar y fortalecer los bíceps',
                'category' => 'strength',
                'difficulty' => 'beginner',
                'calories_per_minute' => 5.0,
                'image_url' => 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800',
                'video_url' => 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
                'muscles_worked' => 'Bíceps',
                'instructions' => '1. Párate con una mancuerna en cada mano\n2. Brazos completamente extendidos a los lados\n3. Palmas hacia adelante\n4. Mantén los codos pegados al cuerpo\n5. Levanta las pesas hacia los hombros\n6. Solo mueve los antebrazos\n7. Baja lentamente a la posición inicial',
                'equipment' => 'Mancuernas o pesas',
                'duration_minutes' => 15,
            ],

            // FLEXIBILITY
            [
                'name' => 'Yoga Flow',
                'description' => 'Secuencia de yoga que mejora flexibilidad, equilibrio y bienestar mental',
                'category' => 'flexibility',
                'difficulty' => 'beginner',
                'calories_per_minute' => 3.0,
                'image_url' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
                'video_url' => 'https://www.youtube.com/watch?v=v7AYKMP6rOE',
                'muscles_worked' => 'Todo el cuerpo',
                'instructions' => '1. Comienza en posición de montaña\n2. Fluye a través de saludos al sol\n3. Incluye posturas de guerrero\n4. Mantén cada postura 5 respiraciones\n5. Respira profunda y conscientemente\n6. Termina con shavasana (relajación)',
                'equipment' => 'Colchoneta de yoga',
                'duration_minutes' => 30,
            ],
            [
                'name' => 'Estiramientos Dinámicos',
                'description' => 'Rutina de estiramientos en movimiento para mejorar rango de movimiento',
                'category' => 'flexibility',
                'difficulty' => 'beginner',
                'calories_per_minute' => 2.5,
                'image_url' => 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
                'video_url' => 'https://www.youtube.com/watch?v=g_tea8ZNk5A',
                'muscles_worked' => 'Todo el cuerpo',
                'instructions' => '1. Círculos de brazos (10 cada dirección)\n2. Rotaciones de cadera (10 cada dirección)\n3. Giros de torso (10 cada lado)\n4. Balanceo de piernas (10 cada pierna)\n5. Elevaciones de rodilla (10 cada pierna)\n6. Mantén movimientos controlados y fluidos',
                'equipment' => 'Ninguno',
                'duration_minutes' => 15,
            ],

            // BALANCE
            [
                'name' => 'Equilibrio en una Pierna',
                'description' => 'Ejercicio para mejorar equilibrio y fortalecer estabilizadores',
                'category' => 'balance',
                'difficulty' => 'beginner',
                'calories_per_minute' => 3.0,
                'image_url' => 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
                'video_url' => 'https://www.youtube.com/watch?v=VfQyu0A5fhE',
                'muscles_worked' => 'Core, Piernas',
                'instructions' => '1. Párate sobre una pierna\n2. Levanta la otra rodilla a 90 grados\n3. Mantén los brazos a los lados o en las caderas\n4. Mira un punto fijo al frente\n5. Mantén la posición 30-60 segundos\n6. Cambia de pierna\n7. Aumenta dificultad cerrando los ojos',
                'equipment' => 'Ninguno',
                'duration_minutes' => 10,
            ],
        ];

        foreach ($exercises as $exercise) {
            Exercise::updateOrCreate(
                ['name' => $exercise['name']],
                $exercise
            );
        }
    }
}
