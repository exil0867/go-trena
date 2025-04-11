-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
DECLARE
BEGIN
    -- Seed exercises
    INSERT INTO exercises (id, name, description, tracking_type) VALUES
    -- Strength exercises (tracked by sets, reps, weight)
    (uuid_generate_v4(), 'Bench Press', 'Lie on a bench and press weight upward', 'reps_sets_weight'),
    (uuid_generate_v4(), 'Squat', 'Lower body strength exercise', 'reps_sets_weight'),
    (uuid_generate_v4(), 'Deadlift', 'Lift barbell from ground to hip level', 'reps_sets_weight'),

    -- Cardio exercises (tracked by time, distance, or calories)
    (uuid_generate_v4(), 'Running', 'Outdoor or treadmill running', 'distance_based'),
    (uuid_generate_v4(), 'Cycling', 'Stationary or road cycling', 'distance_based'),

    -- Flexibility exercises (tracked by time held or difficulty level)
    (uuid_generate_v4(), 'Yoga', 'Series of postures and breathing exercises', 'time_based'),
    (uuid_generate_v4(), 'Stretching', 'Static stretching routines', 'time_based'),

    -- Calisthenics exercises (tracked by sets and reps)
    (uuid_generate_v4(), 'Push-ups', 'Upper body calisthenics exercise', 'reps_sets_weight'),
    (uuid_generate_v4(), 'Pull-ups', 'Upper body pulling exercise', 'reps_sets_weight');
END $$;

-- Seed users (for testing purposes)
SELECT public.create_user('john@example.com', 'john');
SELECT public.create_user('jane@example.com', 'jane');

-- Set up variables for the rest of the script
DO $$
DECLARE
    john_id UUID;
    jane_id UUID;
    weightlifting_id UUID;
    running_id UUID;
    yoga_id UUID;
    crossfit_id UUID;
    john_weightlifting_id UUID;
    john_running_id UUID;
    jane_yoga_id UUID;
    jane_crossfit_id UUID;
    john_strength_plan_id UUID;
    john_cardio_plan_id UUID;
    jane_yoga_plan_id UUID;
    jane_crossfit_plan_id UUID;
    monday_chest_id UUID;
    wednesday_legs_id UUID;
    tuesday_hiit_id UUID;
    thursday_distance_id UUID;
    monday_vinyasa_id UUID;
    friday_yin_id UUID;
    tuesday_amrap_id UUID;
    saturday_fortime_id UUID;
    bench_press_id UUID;
    squat_id UUID;
    deadlift_id UUID;
    running_id_ex UUID;
    cycling_id UUID;
    yoga_id_ex UUID;
    stretching_id UUID;
    pushups_id UUID;
    pullups_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO john_id FROM users WHERE email = 'john@example.com' LIMIT 1;
    SELECT id INTO jane_id FROM users WHERE email = 'jane@example.com' LIMIT 1;

    -- Get exercise IDs
    SELECT id INTO bench_press_id FROM exercises WHERE name = 'Bench Press' LIMIT 1;
    SELECT id INTO squat_id FROM exercises WHERE name = 'Squat' LIMIT 1;
    SELECT id INTO deadlift_id FROM exercises WHERE name = 'Deadlift' LIMIT 1;
    SELECT id INTO running_id_ex FROM exercises WHERE name = 'Running' LIMIT 1;
    SELECT id INTO cycling_id FROM exercises WHERE name = 'Cycling' LIMIT 1;
    SELECT id INTO yoga_id_ex FROM exercises WHERE name = 'Yoga' LIMIT 1;
    SELECT id INTO stretching_id FROM exercises WHERE name = 'Stretching' LIMIT 1;
    SELECT id INTO pushups_id FROM exercises WHERE name = 'Push-ups' LIMIT 1;
    SELECT id INTO pullups_id FROM exercises WHERE name = 'Pull-ups' LIMIT 1;

    -- Seed plans
    INSERT INTO plans (id, user_id, name) VALUES
    (uuid_generate_v4(), john_id, 'John''s Strength Plan'),
    (uuid_generate_v4(), john_id, 'John''s Cardio Plan'),
    (uuid_generate_v4(), jane_id, 'Jane''s Yoga Plan'),
    (uuid_generate_v4(), jane_id, 'Jane''s CrossFit Plan');

    -- Get plan IDs
    SELECT id INTO john_strength_plan_id FROM plans WHERE name = 'John''s Strength Plan' LIMIT 1;
    SELECT id INTO john_cardio_plan_id FROM plans WHERE name = 'John''s Cardio Plan' LIMIT 1;
    SELECT id INTO jane_yoga_plan_id FROM plans WHERE name = 'Jane''s Yoga Plan' LIMIT 1;
    SELECT id INTO jane_crossfit_plan_id FROM plans WHERE name = 'Jane''s CrossFit Plan' LIMIT 1;

    -- Seed exercise groups
    INSERT INTO exercise_groups (id, plan_id, day_of_week, name) VALUES
    -- John's Strength Plan
    (uuid_generate_v4(), john_strength_plan_id, 1, 'Monday - Chest'),
    (uuid_generate_v4(), john_strength_plan_id, 3, 'Wednesday - Legs'),
    -- John's Cardio Plan
    (uuid_generate_v4(), john_cardio_plan_id, 2, 'Tuesday - HIIT'),
    (uuid_generate_v4(), john_cardio_plan_id, 4, 'Thursday - Long Distance'),
    -- Jane's Yoga Plan
    (uuid_generate_v4(), jane_yoga_plan_id, 1, 'Monday - Vinyasa'),
    (uuid_generate_v4(), jane_yoga_plan_id, 5, 'Friday - Yin'),
    -- Jane's CrossFit Plan
    (uuid_generate_v4(), jane_crossfit_plan_id, 2, 'Tuesday - AMRAP'),
    (uuid_generate_v4(), jane_crossfit_plan_id, 6, 'Saturday - For Time');

    -- Get exercise group IDs
    SELECT id INTO monday_chest_id FROM exercise_groups WHERE name = 'Monday - Chest' LIMIT 1;
    SELECT id INTO wednesday_legs_id FROM exercise_groups WHERE name = 'Wednesday - Legs' LIMIT 1;
    SELECT id INTO tuesday_hiit_id FROM exercise_groups WHERE name = 'Tuesday - HIIT' LIMIT 1;
    SELECT id INTO thursday_distance_id FROM exercise_groups WHERE name = 'Thursday - Long Distance' LIMIT 1;
    SELECT id INTO monday_vinyasa_id FROM exercise_groups WHERE name = 'Monday - Vinyasa' LIMIT 1;
    SELECT id INTO friday_yin_id FROM exercise_groups WHERE name = 'Friday - Yin' LIMIT 1;
    SELECT id INTO tuesday_amrap_id FROM exercise_groups WHERE name = 'Tuesday - AMRAP' LIMIT 1;
    SELECT id INTO saturday_fortime_id FROM exercise_groups WHERE name = 'Saturday - For Time' LIMIT 1;

    -- Seed exercise_group_exercises
    INSERT INTO exercise_group_exercises (exercise_group_id, exercise_id) VALUES
    -- John's Strength Plan - Monday Chest
    (monday_chest_id, bench_press_id),
    (monday_chest_id, pushups_id),
    -- John's Strength Plan - Wednesday Legs
    (wednesday_legs_id, squat_id),
    (wednesday_legs_id, deadlift_id),
    -- John's Cardio Plan - Tuesday HIIT
    (tuesday_hiit_id, running_id_ex),
    -- John's Cardio Plan - Thursday Long Distance
    (thursday_distance_id, cycling_id),
    -- Jane's Yoga Plan - Monday Vinyasa
    (monday_vinyasa_id, yoga_id_ex),
    -- Jane's Yoga Plan - Friday Yin
    (friday_yin_id, stretching_id),
    -- Jane's CrossFit Plan - Tuesday AMRAP
    (tuesday_amrap_id, pushups_id),
    (tuesday_amrap_id, pullups_id),
    -- Jane's CrossFit Plan - Saturday For Time
    (saturday_fortime_id, pushups_id),
    (saturday_fortime_id, squat_id);

    -- Seed exercise_logs
    INSERT INTO exercise_logs (id, exercise_id, user_id, metrics) VALUES
    -- John's logs
    (uuid_generate_v4(), bench_press_id, john_id, '{"sets": 3, "reps": 10, "weight": 135}'),
    (uuid_generate_v4(), squat_id, john_id, '{"sets": 4, "reps": 8, "weight": 185}'),
    (uuid_generate_v4(), running_id_ex, john_id, '{"distance": 5.2, "duration": 28, "heart_rate": 165}'),
    -- Jane's logs
    (uuid_generate_v4(), yoga_id_ex, jane_id, '{"duration": 45, "difficulty": 3}'),
    (uuid_generate_v4(), pushups_id, jane_id, '{"sets": 3, "reps": 15}'),
    (uuid_generate_v4(), pullups_id, jane_id, '{"sets": 4, "reps": 8}');
END $$;
