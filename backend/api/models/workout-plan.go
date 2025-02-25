package api

import "github.com/google/uuid"

// WorkoutPlan represents a workout plan (split) for a user.
type WorkoutPlan struct {
	ID         uuid.UUID `json:"id"`
	UserID     uuid.UUID `json:"user_id"`
	ActivityID uuid.UUID `json:"activity_id"`
	Name       string    `json:"name"`
}
