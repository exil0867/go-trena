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
	Date       string                 `json:"date"` // YYYY-MM-DD format
	Metrics    map[string]interface{} `json:"metrics"`
	CreatedAt  time.Time              `json:"created_at"`
}

// Implement Marshaler/Unmarshaler if needed for custom JSON handling
func (el *ExerciseLog) MarshalJSON() ([]byte, error) {
	type Alias ExerciseLog
	return json.Marshal(&struct {
		*Alias
	}{
		Alias: (*Alias)(el),
	})
}
