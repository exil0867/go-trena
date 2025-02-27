package models

import "github.com/google/uuid"

type ExerciseCategory struct {
	ID                uuid.UUID              `json:"id"`
	Name              uuid.UUID              `json:"name"`
	MeasurementFields map[string]interface{} `json:"measurement_fields"`
}

type Exercise struct {
	ID              uuid.UUID `json:"id"`
	ExerciseGroupID uuid.UUID `json:"exercise_group_id"`
	Name            string    `json:"name"`
	CategoryID      uuid.UUID `json:"category_id"`
	Description     string    `json:"description"`
}
