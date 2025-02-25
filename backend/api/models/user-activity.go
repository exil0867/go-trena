package api

import "github.com/google/uuid"

// UserActivity links users to activities they participate in.
type UserActivity struct {
	ID         uuid.UUID `json:"id"`
	UserID     uuid.UUID `json:"user_id"`
	ActivityID uuid.UUID `json:"activity_id"`
}
