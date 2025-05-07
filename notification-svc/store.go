package main

import (
	"sync"
	"time"
)

type Notification struct {
	ID                        int       `json:"id"`
	VehicleID                 string    `json:"vehicle_id"`
	VehicleRegistrationNumber string    `json:"vehicle_registration_number"`
	EventTypeName             string    `json:"event_type_name"`
	DueDate                   time.Time `json:"due_date"`
	Status                    string    `json:"status"`
	CreatedAt                 time.Time `json:"created_at"`
}

type Store struct {
	sync.RWMutex
	data []Notification
}

func NewStore() *Store {
	return &Store{
		data: make([]Notification, 0),
	}
}

func (s *Store) AddBatch(notifications []Notification) {
	s.Lock()
	defer s.Unlock()

	s.data = nil

	for _, n := range notifications {
		n.CreatedAt = time.Now()
		s.data = append(s.data, n)
	}
}

func (s *Store) Get() []Notification {
	s.RLock()
	defer s.RUnlock()

	return append([]Notification(nil), s.data...)
}

func (s *Store) Clean() {
	s.Lock()
	defer s.Unlock()

	s.data = nil // lub: s.data = make([]Notification, 0)
}
