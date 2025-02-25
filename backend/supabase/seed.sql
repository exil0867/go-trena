-- Insert Users
INSERT INTO users (id) VALUES
    (gen_random_uuid()),
    (gen_random_uuid());

-- Insert Activities
INSERT INTO activities (id, name) VALUES
    (gen_random_uuid(), 'Resistance Training'),
    (gen_random_uuid(), 'Running');

-- Insert User Activities
INSERT INTO user_activities (id, user_id, activity_id)
SELECT gen_random_uuid(), u.id, a.id
FROM users u, activities a
WHERE a.name = 'Resistance Training'
LIMIT 1;

-- Insert Workouts
INSERT INTO workouts (id, activity_id, name, type)
SELECT gen_random_uuid(), a.id, 'Bench Press', 'resistance'
FROM activities a WHERE a.name = 'Resistance Training'
UNION ALL
SELECT gen_random_uuid(), a.id, 'Treadmill', 'cardio'
FROM activities a WHERE a.name = 'Running';

-- Insert Workout Plans
INSERT INTO workout_plans (id, user_id, activity_id, name)
SELECT gen_random_uuid(), u.id, a.id, 'Strength Training Plan'
FROM users u, activities a
WHERE a.name = 'Resistance Training'
LIMIT 1;

-- Insert Workout Plan Days
INSERT INTO workout_plan_days (id, workout_plan_id, day_number)
SELECT gen_random_uuid(), wp.id, 1
FROM workout_plans wp
WHERE wp.name = 'Strength Training Plan';

-- Insert Workout Groups
INSERT INTO workout_groups (id, name) VALUES
    (gen_random_uuid(), 'Biceps Workouts'),
    (gen_random_uuid(), 'Chest Workouts');

-- Insert Workout Group Exercises
INSERT INTO workout_group_exercises (id, workout_group_id, exercise_id)
SELECT gen_random_uuid(), wg.id, w.id
FROM workout_groups wg, workouts w
WHERE wg.name = 'Biceps Workouts' AND w.name = 'Bench Press'
LIMIT 1;

-- Insert Logged Workouts
INSERT INTO logged_workouts (id, user_id, workout_id, date)
SELECT gen_random_uuid(), u.id, w.id, now()
FROM users u, workouts w
WHERE w.name = 'Bench Press'
LIMIT 1;

-- Insert Logged Sets
INSERT INTO logged_sets (id, logged_workout_id, reps, weight)
SELECT gen_random_uuid(), lw.id, 10, 50.0
FROM logged_workouts lw
LIMIT 1;

-- Insert Logged Cardio
INSERT INTO logged_cardio (id, logged_workout_id, speed, duration, pace)
SELECT gen_random_uuid(), lw.id, 10.0, 30, 6.0
FROM logged_workouts lw
LIMIT 1;
