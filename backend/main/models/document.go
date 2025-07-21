package models

import (
	"time"

	"github.com/google/uuid"
)

type DocumentStatus string
type DocumentType string

const (
	StatusWithdrawn DocumentStatus = "withdrawn"
	StatusAdded     DocumentStatus = "added"
	StatusIncorrect DocumentStatus = "incorrect"
)

const (
	TypeRevenue DocumentType = "revenue"
	TypeCost    DocumentType = "cost"
)

type Document struct {
	ID         uuid.UUID
	ReadableID string
	Status     DocumentStatus
	Type       DocumentType
	Source     string
	CreatedBy  uuid.UUID
	CreatedAt  time.Time
}
