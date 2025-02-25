package api

import (
	"time"

	"github.com/google/uuid"
)

// LoggedWorkout represents a logged workout session.
type LoggedWorkout struct {
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"user_id"`
	WorkoutID uuid.UUID `json:"workout_id"`
	Date      time.Time `json:"date"`
}
