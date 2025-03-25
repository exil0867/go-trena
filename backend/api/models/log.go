package models

import (
	"github.com/google/uuid"
)

type ExerciseLog struct {
	ID         uuid.UUID              `json:"id"`
	ExerciseID uuid.UUID              `json:"exercise_id"`
	UserID     uuid.UUID              `json:"user_id"`
	Metrics    map[string]interface{} `json:"metrics"`
	CreatedAt  string                 `json:"created_at"`
}

type UpsertExerciseLog struct {
	ExerciseID uuid.UUID              `json:"exercise_id"`
	UserID     uuid.UUID              `json:"user_id"`
	Metrics    map[string]interface{} `json:"metrics"`
}
