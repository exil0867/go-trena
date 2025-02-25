package api

import "github.com/google/uuid"

// WorkoutGroup represents a group of alternative exercises.
type WorkoutGroup struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}
