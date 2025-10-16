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
                'name' => 'Running',
                'type' => 'cardio',
                'muscle' => 'quadriceps',
                'equipment' => 'none',
                'difficulty' => 'beginner',
                'instructions' => 'Run at a steady pace. Start with a warm-up walk, then increase to a comfortable running pace. Maintain good posture and breathe rhythmically.',
                'calories_per_minute' => 12,
            ],
            [
                'name' => 'Jumping Jacks',
                'type' => 'cardio',
                'muscle' => 'abdominals',
                'equipment' => 'none',
                'difficulty' => 'beginner',
                'instructions' => 'Stand with feet together and hands at sides. Jump while spreading legs and raising arms overhead. Return to starting position and repeat.',
                'calories_per_minute' => 10,
            ],
            [
                'name' => 'Burpees',
                'type' => 'cardio',
                'muscle' => 'chest',
                'equipment' => 'none',
                'difficulty' => 'intermediate',
                'instructions' => 'Start standing, drop into a squat, kick feet back to plank, do a push-up, jump feet forward, and jump up explosively.',
                'calories_per_minute' => 15,
            ],

            // STRENGTH - CHEST
            [
                'name' => 'Push-ups',
                'type' => 'strength',
                'muscle' => 'chest',
                'equipment' => 'none',
                'difficulty' => 'beginner',
                'instructions' => 'Start in plank position with hands shoulder-width apart. Lower body until chest nearly touches floor, then push back up.',
                'calories_per_minute' => 8,
            ],
            [
                'name' => 'Bench Press',
                'type' => 'strength',
                'muscle' => 'chest',
                'equipment' => 'barbell',
                'difficulty' => 'intermediate',
                'instructions' => 'Lie on bench, grip barbell slightly wider than shoulders, lower to chest, press up explosively.',
                'calories_per_minute' => 7,
            ],

            // STRENGTH - BICEPS
            [
                'name' => 'Bicep Curls',
                'type' => 'strength',
                'muscle' => 'biceps',
                'equipment' => 'dumbbells',
                'difficulty' => 'beginner',
                'instructions' => 'Stand with dumbbells at sides. Curl weights up toward shoulders, keeping elbows stationary. Lower slowly.',
                'calories_per_minute' => 5,
            ],
            [
                'name' => 'Hammer Curls',
                'type' => 'strength',
                'muscle' => 'biceps',
                'equipment' => 'dumbbells',
                'difficulty' => 'beginner',
                'instructions' => 'Hold dumbbells with palms facing each other. Curl up toward shoulders maintaining grip position.',
                'calories_per_minute' => 5,
            ],

            // STRENGTH - TRICEPS
            [
                'name' => 'Tricep Dips',
                'type' => 'strength',
                'muscle' => 'triceps',
                'equipment' => 'none',
                'difficulty' => 'intermediate',
                'instructions' => 'Use parallel bars or bench. Lower body by bending elbows to 90 degrees, then push back up.',
                'calories_per_minute' => 7,
            ],

            // STRENGTH - LEGS
            [
                'name' => 'Squats',
                'type' => 'strength',
                'muscle' => 'quadriceps',
                'equipment' => 'none',
                'difficulty' => 'beginner',
                'instructions' => 'Stand with feet shoulder-width apart. Lower hips back and down as if sitting, keep chest up. Push through heels to stand.',
                'calories_per_minute' => 8,
            ],
            [
                'name' => 'Lunges',
                'type' => 'strength',
                'muscle' => 'quadriceps',
                'equipment' => 'none',
                'difficulty' => 'beginner',
                'instructions' => 'Step forward with one leg, lower hips until both knees bent at 90 degrees. Push back to start.',
                'calories_per_minute' => 7,
            ],
            [
                'name' => 'Deadlifts',
                'type' => 'strength',
                'muscle' => 'hamstrings',
                'equipment' => 'barbell',
                'difficulty' => 'intermediate',
                'instructions' => 'Stand with feet hip-width, grip barbell. Lift by extending hips and knees, keeping back straight.',
                'calories_per_minute' => 9,
            ],
            [
                'name' => 'Calf Raises',
                'type' => 'strength',
                'muscle' => 'calves',
                'equipment' => 'none',
                'difficulty' => 'beginner',
                'instructions' => 'Stand on balls of feet. Raise heels as high as possible, hold briefly, lower slowly.',
                'calories_per_minute' => 4,
            ],

            // STRENGTH - BACK
            [
                'name' => 'Pull-ups',
                'type' => 'strength',
                'muscle' => 'lats',
                'equipment' => 'pull-up bar',
                'difficulty' => 'intermediate',
                'instructions' => 'Hang from bar with overhand grip. Pull body up until chin over bar, lower with control.',
                'calories_per_minute' => 10,
            ],
            [
                'name' => 'Bent Over Rows',
                'type' => 'strength',
                'muscle' => 'middle_back',
                'equipment' => 'barbell',
                'difficulty' => 'intermediate',
                'instructions' => 'Bend at hips with back straight. Pull barbell to lower chest, squeeze shoulder blades together.',
                'calories_per_minute' => 7,
            ],

            // STRENGTH - SHOULDERS
            [
                'name' => 'Shoulder Press',
                'type' => 'strength',
                'muscle' => 'shoulders',
                'equipment' => 'dumbbells',
                'difficulty' => 'beginner',
                'instructions' => 'Press dumbbells overhead from shoulder height. Lower with control.',
                'calories_per_minute' => 6,
            ],

            // CORE
            [
                'name' => 'Plank',
                'type' => 'strength',
                'muscle' => 'abdominals',
                'equipment' => 'none',
                'difficulty' => 'beginner',
                'instructions' => 'Hold push-up position with forearms on ground. Keep body straight, engage core.',
                'calories_per_minute' => 5,
            ],
            [
                'name' => 'Crunches',
                'type' => 'strength',
                'muscle' => 'abdominals',
                'equipment' => 'none',
                'difficulty' => 'beginner',
                'instructions' => 'Lie on back, knees bent. Lift shoulders off ground using abs, lower with control.',
                'calories_per_minute' => 4,
            ],
            [
                'name' => 'Russian Twists',
                'type' => 'strength',
                'muscle' => 'abdominals',
                'equipment' => 'none',
                'difficulty' => 'intermediate',
                'instructions' => 'Sit with knees bent, lean back slightly. Rotate torso side to side, touching floor beside hips.',
                'calories_per_minute' => 6,
            ],

            // GLUTES
            [
                'name' => 'Hip Thrusts',
                'type' => 'strength',
                'muscle' => 'glutes',
                'equipment' => 'none',
                'difficulty' => 'beginner',
                'instructions' => 'Lie on back with knees bent. Lift hips by squeezing glutes until body forms straight line.',
                'calories_per_minute' => 6,
            ],
            [
                'name' => 'Glute Bridges',
                'type' => 'strength',
                'muscle' => 'glutes',
                'equipment' => 'none',
                'difficulty' => 'beginner',
                'instructions' => 'Lie on back, feet flat. Lift hips off ground, squeeze glutes at top, lower slowly.',
                'calories_per_minute' => 5,
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
