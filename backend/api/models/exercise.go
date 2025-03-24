package models

import (
	"encoding/json"

	"github.com/google/uuid"
)

type ExerciseCategory struct {
	ID                uuid.UUID       `json:"id"`
	Name              string          `json:"name"`
	MeasurementFields json.RawMessage `json:"measurement_fields"`
}

type UpsertExerciseCategory struct {
	Name              string          `json:"name"`
	MeasurementFields json.RawMessage `json:"measurement_fields"`
}

type Exercise struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	CategoryID  uuid.UUID `json:"category_id"`
	Description string    `json:"description"`
}

type UpsertExercise struct {
	Name        string    `json:"name"`
	CategoryID  uuid.UUID `json:"category_id"`
	Description string    `json:"description"`
}

type ExerciseGroupExercise struct {
	ExerciseGroupID uuid.UUID `json:"exercise_group_id"`
	ExerciseID      uuid.UUID `json:"exercise_id"`
}

type UpsertExerciseGroupExercise struct {
	ExerciseGroupID uuid.UUID `json:"exercise_group_id"`
	ExerciseID      uuid.UUID `json:"exercise_id"`
}

// Create the response structure
type GroupExercisesResponse struct {
	ExerciseGroupID uuid.UUID  `json:"exercise_group_id"`
	GroupName       string     `json:"group_name"`
	Exercises       []Exercise `json:"exercises"`
}

type GroupExerciseResponse struct {
	ExerciseGroupID uuid.UUID `json:"exercise_group_id"`
	GroupName       string    `json:"group_name"`
	Exercise        Exercise  `json:"exercise"`
}
