package api

import "github.com/google/uuid"

// WorkoutGroupExercise links exercises to a workout group.
type WorkoutGroupExercise struct {
	ID             uuid.UUID `json:"id"`
	WorkoutGroupID uuid.UUID `json:"workout_group_id"`
	ExerciseID     uuid.UUID `json:"exercise_id"`
}
