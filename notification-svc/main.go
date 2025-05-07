package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/lib/pq"
)

func checkEvents(db *sql.DB, s *Store) {
	query := `
WITH latest_events AS (
	SELECT DISTINCT ON (e.vehicle_id, e.event_type_id)
		e.vehicle_id,
		e.event_type_id,
		e.event_date,
		e.odometer_km,
		ei.distance_interval_km,
		ei.time_interval
	FROM events e
	JOIN event_intervals ei 
		ON e.vehicle_id = ei.vehicle_id 
		AND e.event_type_id = ei.event_type_id
	ORDER BY e.vehicle_id, e.event_type_id, e.event_date DESC
),
overdue_events AS (
	SELECT
		le.vehicle_id,
		v.registration_number,
		le.event_type_id,
		et.name AS event_type_name,
		le.event_date,
		(le.event_date + le.time_interval) AS due_date,
		CASE
			WHEN le.time_interval IS NOT NULL AND CURRENT_DATE > (le.event_date + le.time_interval)
				THEN 'CRITICAL'
			WHEN le.time_interval IS NOT NULL AND CURRENT_DATE + INTERVAL '60 days' > (le.event_date + le.time_interval)
				THEN 'WARNING'
			ELSE 'INFO'
		END AS status,
		CURRENT_DATE AS today,
		(CURRENT_DATE - le.event_date) AS days_since,
		false AS distance_overdue
	FROM latest_events le
	JOIN event_types et ON le.event_type_id = et.id
	JOIN vehicles v ON le.vehicle_id = v.id
)
SELECT
	vehicle_id,
	registration_number,
	event_type_name,
	status,
	due_date
FROM overdue_events
WHERE status = 'CRITICAL' OR status = 'WARNING';

	`

	rows, err := db.Query(query)
	if err != nil {
		log.Printf("Błąd wykonania zapytania: %v", err)
		return
	}
	defer rows.Close()

	var notifications []Notification
	for rows.Next() {
		var notification Notification

		err := rows.Scan(&notification.VehicleID, &notification.VehicleRegistrationNumber, &notification.EventTypeName, &notification.Status, &notification.DueDate)
		if err != nil {
			log.Printf("Błąd przy skanowaniu wiersza: %v", err)
			continue
		}

		notifications = append(notifications, notification)
	}

	if err := rows.Err(); err != nil {
		log.Printf("Błąd przy odczycie wyników: %v", err)
	}
	s.AddBatch(notifications)
}

func startServer(s *Store) {
	http.HandleFunc("/notifications", func(w http.ResponseWriter, r *http.Request) {
		data := s.Get()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	})

	log.Println("Serwer HTTP dostępny na :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func main() {
	host := os.Getenv("POSTGRES_HOST")
	port := os.Getenv("POSTGRES_PORT")
	user := os.Getenv("POSTGRES_USER")
	password := os.Getenv("POSTGRES_PASSWORD")
	dbname := os.Getenv("POSTGRES_DB")

	psqlInfo := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname,
	)

	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatalf("Błąd połączenia z bazą: %v", err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Fatalf("Baza nie odpowiada: %v", err)
	}
	log.Println("Połączono z bazą danych.")
	s := NewStore()

	go startServer(s)

	for {
		checkEvents(db, s)
		time.Sleep(10 * time.Second)
	}
}
