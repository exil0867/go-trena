package api

import "github.com/google/uuid"

// LoggedCardio represents a logged cardio workout.
type LoggedCardio struct {
	ID              uuid.UUID `json:"id"`
	LoggedWorkoutID uuid.UUID `json:"logged_workout_id"`
	Speed           float64   `json:"speed"`
	Duration        int       `json:"duration"`
	Pace            float64   `json:"pace"`
}
