package contract

import (
	"time"
)

type DocumentCostResponse struct {
	ID        string    `json:"id"`
	Status    string    `json:"status"`
	Source    string    `json:"source"`
	CreatedBy string    `json:"created_by"` //TODO: Owner name/surname?
	CreatedAt time.Time `json:"created_at" `
}
