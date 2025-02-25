package api

import "github.com/google/uuid"

// WorkoutPlanDay represents a specific day in a workout plan.
type WorkoutPlanDay struct {
	ID            uuid.UUID `json:"id"`
	WorkoutPlanID uuid.UUID `json:"workout_plan_id"`
	DayNumber     int       `json:"day_number"`
}
