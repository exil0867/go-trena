package api

import "github.com/google/uuid"

// Workout represents an individual workout within an activity.
type Workout struct {
	ID         uuid.UUID `json:"id"`
	ActivityID uuid.UUID `json:"activity_id"`
	Name       string    `json:"name"`
	Type       string    `json:"type"` // "resistance" or "cardio"
}
