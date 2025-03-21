CREATE TABLE exercise_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    measurement_fields JSONB NOT NULL
);

CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    category_id UUID REFERENCES exercise_categories(id) NOT NULL,
    description TEXT
);

CREATE INDEX idx_exercises_category ON exercises(category_id);

CREATE TABLE exercise_group_exercises (
    exercise_group_id UUID REFERENCES exercise_groups(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    PRIMARY KEY (exercise_group_id, exercise_id)
);
