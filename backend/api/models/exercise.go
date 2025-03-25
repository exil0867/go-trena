package models

import (
	"github.com/google/uuid"
)

type Exercise struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	TrackingType string    `json:"tracking_type"`
}

type UpsertExercise struct {
	Name         string `json:"name"`
	Description  string `json:"description"`
	TrackingType string `json:"tracking_type"`
}

type ExerciseGroupExercise struct {
	ExerciseGroupID uuid.UUID `json:"exercise_group_id"`
	ExerciseID      uuid.UUID `json:"exercise_id"`
}

type UpsertExerciseGroupExercise struct {
	ExerciseGroupID uuid.UUID `json:"exercise_group_id"`
	ExerciseID      uuid.UUID `json:"exercise_id"`
}

// Create the response structure
type GroupExercisesResponse struct {
	ExerciseGroupID uuid.UUID  `json:"exercise_group_id"`
	GroupName       string     `json:"group_name"`
	Exercises       []Exercise `json:"exercises"`
}

type GroupExerciseResponse struct {
	ExerciseGroupID uuid.UUID `json:"exercise_group_id"`
	GroupName       string    `json:"group_name"`
	Exercise        Exercise  `json:"exercise"`
}
