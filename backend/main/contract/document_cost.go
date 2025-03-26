package contract

import (
	"time"

	"github.com/google/uuid"
)

type DocumentCostResponse struct {
	ID         uuid.UUID `json:"id"`
	ReadableID string    `json:"readable_id"`
	Status     string    `json:"status"`
	Source     string    `json:"source"`
	CreatedAt  time.Time `json:"created_at" `
}
