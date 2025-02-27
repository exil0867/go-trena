-- -- Ensure the uuid-ossp extension is enabled
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -- Insert activities with UUIDs
-- INSERT INTO activities (id, name, description) VALUES
-- (uuid_generate_v4(), 'Resistance Training', 'Strength training using weights'),
-- (uuid_generate_v4(), 'Running', 'Cardiovascular running exercises'),
-- (uuid_generate_v4(), 'Yoga', 'Flexibility and balance training');

-- -- Insert exercise categories with UUIDs
-- INSERT INTO exercise_categories (id, name, measurement_fields) VALUES
-- (uuid_generate_v4(), 'resistance', '["sets", "reps", "weight"]'),
-- (uuid_generate_v4(), 'cardio', '["duration", "distance", "intensity"]'),
-- (uuid_generate_v4(), 'flexibility', '["duration", "hold_type"]');

-- -- Insert users with UUIDs
-- INSERT INTO users (id, username, email) VALUES
-- (uuid_generate_v4(), 'john_doe', 'john@example.com'),
-- (uuid_generate_v4(), 'jane_smith', 'jane@example.com');

-- -- Insert user activities (John's resistance training)
-- INSERT INTO user_activities (id, user_id, activity_id) VALUES
-- (uuid_generate_v4(), 
--     (SELECT id FROM users WHERE username = 'john_doe'), 
--     (SELECT id FROM activities WHERE name = 'Resistance Training')
-- );

-- -- Insert plans for John's activity
-- INSERT INTO plans (id, user_activity_id, name) VALUES
-- (uuid_generate_v4(), 
--     (SELECT id FROM user_activities WHERE user_id = (SELECT id FROM users WHERE username = 'john_doe') 
--     AND activity_id = (SELECT id FROM activities WHERE name = 'Resistance Training')), 
--     '4-Week Strength Program'
-- );

-- -- Insert exercise groups
-- INSERT INTO exercise_groups (id, plan_id, day_of_week, name) VALUES
-- (uuid_generate_v4(), 
--     (SELECT id FROM plans WHERE name = '4-Week Strength Program'), 
--     0, 'Upper Body Power'),
-- (uuid_generate_v4(), 
--     (SELECT id FROM plans WHERE name = '4-Week Strength Program'), 
--     2, 'Lower Body Strength'),
-- (uuid_generate_v4(), 
--     (SELECT id FROM plans WHERE name = '4-Week Strength Program'), 
--     4, 'Full Body Conditioning');

-- -- Insert exercises into exercise groups
-- INSERT INTO exercises (id, exercise_group_id, name, category_id, description) VALUES
-- (uuid_generate_v4(), 
--     (SELECT id FROM exercise_groups WHERE name = 'Upper Body Power'), 
--     'Barbell Bench Press', 
--     (SELECT id FROM exercise_categories WHERE name = 'resistance'), 
--     'Flat bench chest press'),
-- (uuid_generate_v4(), 
--     (SELECT id FROM exercise_groups WHERE name = 'Upper Body Power'), 
--     'Weighted Pull-ups', 
--     (SELECT id FROM exercise_categories WHERE name = 'resistance'), 
--     'Add weight using belt'),
-- (uuid_generate_v4(), 
--     (SELECT id FROM exercise_groups WHERE name = 'Lower Body Strength'), 
--     'Back Squat', 
--     (SELECT id FROM exercise_categories WHERE name = 'resistance'), 
--     'Barbell back squat'),
-- (uuid_generate_v4(), 
--     (SELECT id FROM exercise_groups WHERE name = 'Full Body Conditioning'), 
--     'Deadlift', 
--     (SELECT id FROM exercise_categories WHERE name = 'resistance'), 
--     'Conventional deadlift form');

-- -- Insert exercise logs with UUIDs
-- INSERT INTO exercise_logs (id, exercise_id, user_id, date, metrics) VALUES
-- (uuid_generate_v4(), 
--     (SELECT id FROM exercises WHERE name = 'Barbell Bench Press'), 
--     (SELECT id FROM users WHERE username = 'john_doe'), 
--     '2023-10-02', '{"sets": 4, "reps": 8, "weight": 70}'),
-- (uuid_generate_v4(), 
--     (SELECT id FROM exercises WHERE name = 'Back Squat'), 
--     (SELECT id FROM users WHERE username = 'john_doe'), 
--     '2023-10-04', '{"sets": 5, "reps": 5, "weight": 120}');
