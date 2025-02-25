package api

import "github.com/google/uuid"

// User represents a user in the database.
type User struct {
	ID uuid.UUID `json:"id"`
}
