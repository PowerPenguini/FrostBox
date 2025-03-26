package models

import (
	"time"

	"github.com/google/uuid"
)

type UserRole string

const (
	Technician UserRole = "technician"
	Manager    UserRole = "manager"
	Admin      UserRole = "admin"
	Client     UserRole = "client"
)

type User struct {
	ID           uuid.UUID
	FirstName    string
	LastName     string
	Role         UserRole
	Email        string
	PasswordHash string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
