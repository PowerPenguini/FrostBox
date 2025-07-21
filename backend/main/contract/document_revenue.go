package contract

import (
	"time"
)

type DocumentsRevenue struct {
	ID          string    `json:"id"`
	Status      string    `json:"status"`
	Source      string    `json:"source"`
	CostsNumber int       `json:"costs_number"`
	CreatedBy   string    `json:"created_by"` //TODO: Owner name/surname?
	CreatedAt   time.Time `json:"created_at" `
}

type DocumentsRevenueResponse []DocumentsRevenue
