package models

import (
	"github.com/google/uuid"
)

type Plan struct {
	ID             uuid.UUID `json:"id"`
	UserActivityID uuid.UUID `json:"user_activity_id"`
	Name           string    `json:"name"`
	// CreatedAt      time.Time `json:"created_at"`
}

type PlanInsert struct {
	UserActivityID uuid.UUID `json:"user_activity_id"`
	Name           string    `json:"name"`
}

type ExerciseGroup struct {
	ID        uuid.UUID `json:"id"`
	PlanID    uuid.UUID `json:"plan_id"`
	DayOfWeek int       `json:"day_of_week"`
	Name      string    `json:"name"`
}
