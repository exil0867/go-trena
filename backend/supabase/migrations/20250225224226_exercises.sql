
CREATE TYPE exercise_tracking_type AS ENUM ('reps_sets_weight', 'time_based', 'distance_based', 'calories');

CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    tracking_type exercise_tracking_type NOT NULL
);

CREATE TABLE exercise_group_exercises (
    exercise_group_id UUID REFERENCES exercise_groups(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    PRIMARY KEY (exercise_group_id, exercise_id)
);
