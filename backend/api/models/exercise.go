package models

import (
	"encoding/json"

	"github.com/google/uuid"
)

type ExerciseCategory struct {
	ID                string          `json:"id"`
	Name              string          `json:"name"`
	MeasurementFields json.RawMessage `json:"measurement_fields"`
}

type UpsertExercise struct {
	Name        string    `json:"name"`
	CategoryID  uuid.UUID `json:"category_id"`
	Description string    `json:"description"`
}

type Exercise struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	CategoryID  uuid.UUID `json:"category_id"`
	Description string    `json:"description"`
}

type ExerciseGroupExercise struct {
	ExerciseGroupID uuid.UUID `json:"exercise_group_id"`
	ExerciseID      uuid.UUID `json:"exercise_id"`
}
