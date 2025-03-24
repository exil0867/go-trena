package models

import (
	"github.com/google/uuid"
)

type Activity struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
}
