package api

import "github.com/google/uuid"

// LoggedSet represents a logged set in a resistance training workout.
type LoggedSet struct {
	ID              uuid.UUID `json:"id"`
	LoggedWorkoutID uuid.UUID `json:"logged_workout_id"`
	Reps            int       `json:"reps"`
	Weight          float64   `json:"weight"`
}
