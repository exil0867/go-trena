
-- Create Workouts Table
CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('resistance', 'cardio'))
);

-- Create Workout Plans (Splits)
CREATE TABLE workout_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    name TEXT NOT NULL
);

-- Create Workout Plan Days
CREATE TABLE workout_plan_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_plan_id UUID REFERENCES workout_plans(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL
);

-- Create Workout Groups (Alternatives)
CREATE TABLE workout_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL
);

-- Create Workout Group Exercises
CREATE TABLE workout_group_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_group_id UUID REFERENCES workout_groups(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES workouts(id) ON DELETE CASCADE
);

-- Create Logged Workouts
CREATE TABLE logged_workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    date TIMESTAMP DEFAULT now()
);

-- Create Logged Sets (For Resistance Training)
CREATE TABLE logged_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    logged_workout_id UUID REFERENCES logged_workouts(id) ON DELETE CASCADE,
    reps INTEGER NOT NULL,
    weight DECIMAL NOT NULL
);

-- Create Logged Cardio Workouts
CREATE TABLE logged_cardio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    logged_workout_id UUID REFERENCES logged_workouts(id) ON DELETE CASCADE,
    speed DECIMAL NOT NULL,
    duration INTEGER NOT NULL,
    pace DECIMAL NOT NULL
);
