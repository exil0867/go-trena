package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type ExerciseLog struct {
	ID         uuid.UUID              `json:"id"`
	ExerciseID uuid.UUID              `json:"exercise_id"`
	UserID     uuid.UUID              `json:"user_id"`
	Date       string                 `json:"date"`
	Metrics    map[string]interface{} `json:"metrics"`
	CreatedAt  time.Time              `json:"created_at"`
}

type UpsertExerciseLog struct {
	ExerciseID uuid.UUID              `json:"exercise_id"`
	UserID     uuid.UUID              `json:"user_id"`
	Date       string                 `json:"date"`
	Metrics    map[string]interface{} `json:"metrics"`
}

// Marshaler/Unmarshaler if needed for custom JSON handling
func (el *ExerciseLog) MarshalJSON() ([]byte, error) {
	type Alias ExerciseLog
	return json.Marshal(&struct {
		*Alias
	}{
		Alias: (*Alias)(el),
	})
}
