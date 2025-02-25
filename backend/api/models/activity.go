package api

import "github.com/google/uuid"

// Activity represents an activity like running or resistance training.
type Activity struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}
