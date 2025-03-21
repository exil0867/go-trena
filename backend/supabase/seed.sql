-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Seed exercise categories
INSERT INTO exercise_categories (id, name, measurement_fields) VALUES
(uuid_generate_v4(), 'Strength', '{"sets": "integer", "reps": "integer", "weight": "float"}'),
(uuid_generate_v4(), 'Cardio', '{"distance": "float", "duration": "integer", "heart_rate": "integer"}'),
(uuid_generate_v4(), 'Flexibility', '{"duration": "integer", "difficulty": "integer"}'),
(uuid_generate_v4(), 'Calisthenics', '{"sets": "integer", "reps": "integer"}');

-- Get the IDs of the categories we just inserted
DO $$
DECLARE
    strength_id UUID;
    cardio_id UUID;
    flexibility_id UUID;
    calisthenics_id UUID;
BEGIN
    SELECT id INTO strength_id FROM exercise_categories WHERE name = 'Strength' LIMIT 1;
    SELECT id INTO cardio_id FROM exercise_categories WHERE name = 'Cardio' LIMIT 1;
    SELECT id INTO flexibility_id FROM exercise_categories WHERE name = 'Flexibility' LIMIT 1;
    SELECT id INTO calisthenics_id FROM exercise_categories WHERE name = 'Calisthenics' LIMIT 1;

    -- Seed exercises
    INSERT INTO exercises (id, name, category_id, description) VALUES
    -- Strength exercises
    (uuid_generate_v4(), 'Bench Press', strength_id, 'Lie on a bench and press weight upward'),
    (uuid_generate_v4(), 'Squat', strength_id, 'Lower body strength exercise'),
    (uuid_generate_v4(), 'Deadlift', strength_id, 'Lift barbell from ground to hip level'),
    -- Cardio exercises
    (uuid_generate_v4(), 'Running', cardio_id, 'Outdoor or treadmill running'),
    (uuid_generate_v4(), 'Cycling', cardio_id, 'Stationary or road cycling'),
    -- Flexibility exercises
    (uuid_generate_v4(), 'Yoga', flexibility_id, 'Series of postures and breathing exercises'),
    (uuid_generate_v4(), 'Stretching', flexibility_id, 'Static stretching routines'),
    -- Calisthenics exercises
    (uuid_generate_v4(), 'Push-ups', calisthenics_id, 'Upper body calisthenics exercise'),
    (uuid_generate_v4(), 'Pull-ups', calisthenics_id, 'Upper body pulling exercise');
END $$;

-- Seed activities
INSERT INTO activities (id, name, description) VALUES
(uuid_generate_v4(), 'Weightlifting', 'Resistance training using weights'),
(uuid_generate_v4(), 'Running', 'Cardio exercise on foot'),
(uuid_generate_v4(), 'Yoga', 'Mind-body practice'),
(uuid_generate_v4(), 'CrossFit', 'High-intensity functional training');

-- Seed users (for testing purposes)
SELECT public.create_user('john.doe@example.com', 'qwerty');
SELECT public.create_user('jane.smith@example.com', 'qwerty');

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
    SELECT id INTO john_id FROM users WHERE email = 'john.doe@example.com' LIMIT 1;
    SELECT id INTO jane_id FROM users WHERE email = 'jane.smith@example.com' LIMIT 1;

    -- Get activity IDs
    SELECT id INTO weightlifting_id FROM activities WHERE name = 'Weightlifting' LIMIT 1;
    SELECT id INTO running_id FROM activities WHERE name = 'Running' LIMIT 1;
    SELECT id INTO yoga_id FROM activities WHERE name = 'Yoga' LIMIT 1;
    SELECT id INTO crossfit_id FROM activities WHERE name = 'CrossFit' LIMIT 1;

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

    -- Seed user activities
    INSERT INTO user_activities (id, user_id, activity_id) VALUES
    (uuid_generate_v4(), john_id, weightlifting_id),
    (uuid_generate_v4(), john_id, running_id),
    (uuid_generate_v4(), jane_id, yoga_id),
    (uuid_generate_v4(), jane_id, crossfit_id);

    -- Get user activity IDs
    SELECT id INTO john_weightlifting_id FROM user_activities
    WHERE user_id = john_id AND activity_id = weightlifting_id LIMIT 1;

    SELECT id INTO john_running_id FROM user_activities
    WHERE user_id = john_id AND activity_id = running_id LIMIT 1;

    SELECT id INTO jane_yoga_id FROM user_activities
    WHERE user_id = jane_id AND activity_id = yoga_id LIMIT 1;

    SELECT id INTO jane_crossfit_id FROM user_activities
    WHERE user_id = jane_id AND activity_id = crossfit_id LIMIT 1;

    -- Seed plans
    INSERT INTO plans (id, user_activity_id, name) VALUES
    (uuid_generate_v4(), john_weightlifting_id, 'John''s Strength Plan'),
    (uuid_generate_v4(), john_running_id, 'John''s Cardio Plan'),
    (uuid_generate_v4(), jane_yoga_id, 'Jane''s Yoga Plan'),
    (uuid_generate_v4(), jane_crossfit_id, 'Jane''s CrossFit Plan');

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
    INSERT INTO exercise_logs (id, exercise_id, user_id, date, metrics) VALUES
    -- John's logs
    (uuid_generate_v4(), bench_press_id, john_id, '2025-03-10', '{"sets": 3, "reps": 10, "weight": 135}'),
    (uuid_generate_v4(), squat_id, john_id, '2025-03-12', '{"sets": 4, "reps": 8, "weight": 185}'),
    (uuid_generate_v4(), running_id_ex, john_id, '2025-03-11', '{"distance": 5.2, "duration": 28, "heart_rate": 165}'),
    -- Jane's logs
    (uuid_generate_v4(), yoga_id_ex, jane_id, '2025-03-10', '{"duration": 45, "difficulty": 3}'),
    (uuid_generate_v4(), pushups_id, jane_id, '2025-03-12', '{"sets": 3, "reps": 15}'),
    (uuid_generate_v4(), pullups_id, jane_id, '2025-03-12', '{"sets": 4, "reps": 8}');
END $$;
