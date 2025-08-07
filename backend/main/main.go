package main

import (
	"fmt"
	"frostbox/config"
	"frostbox/di"
	"frostbox/handlers"
	"frostbox/middleware"
	"log"
	"net/http"
	"os"
)

// func getUserProfile(w http.ResponseWriter, r *http.Request) {
// 	user := r.Context().Value("user").(repos.User)
// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(user)
// }

func main() {
	if err := config.LoadJWTKeys("/secrets/jwt-private.pem", "/secrets/jwt-public.pem"); err != nil {
		log.Fatalf("❌ Failed to load EC keys: %v", err)
	}

	mux := http.NewServeMux()

	connStr := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		os.Getenv("POSTGRES_USER"),
		os.Getenv("POSTGRES_PASSWORD"),
		os.Getenv("POSTGRES_HOST"),
		os.Getenv("POSTGRES_PORT"),
		os.Getenv("POSTGRES_DB"),
	)

	di, err := di.NewDI(connStr)
	if err != nil {
		panic(err)
	}
	documentsHandler := handlers.NewDocumentsHandler(di)
	vehiclesHandler := handlers.NewVehiclesHandler(di)
	costsHandler := handlers.NewCostsHandler(di)
	revenuesHandler := handlers.NewRevenuesHandler(di)
	usersHandler := handlers.NewUsersHandler(di)
	intervalsHandler := handlers.NewIntervalsHandler(di)
	eventsHandler := handlers.NewEventsHandler(di)
	authHandler := handlers.NewAuthHandler(di)
	enventsTypesHandler := handlers.NewEventsTypesHandler(di)

	// --- Vehicles ---
	mux.HandleFunc("GET /vehicles", middleware.AuthMiddleware(di, vehiclesHandler.GetVehicles))
	mux.HandleFunc("POST /vehicles", middleware.AuthMiddleware(di, vehiclesHandler.PostVehicles))
	mux.HandleFunc("GET /vehicles/available", middleware.AuthMiddleware(di, vehiclesHandler.GetVehiclesAvailable))
	mux.HandleFunc("GET /vehicles/{vehicle_id}/tolls", middleware.AuthMiddleware(di, vehiclesHandler.GetVehicleTolls))
	mux.HandleFunc("GET /vehicles/{vehicle_id}/profitability", middleware.AuthMiddleware(di, vehiclesHandler.GetVehicleProfitability))
	mux.HandleFunc("GET /vehicles/{vehicle_id}/fuel", middleware.AuthMiddleware(di, vehiclesHandler.GetVehicleFuel))
	mux.HandleFunc("GET /vehicles/{vehicle_id}/intervals", middleware.AuthMiddleware(di, intervalsHandler.GetIntervals))

	// --- Events ---
	mux.HandleFunc("GET /vehicles/{vehicle_id}/events", middleware.AuthMiddleware(di, eventsHandler.GetEventsByVehicle))
	mux.HandleFunc("POST /vehicles/{vehicle_id}/events", middleware.AuthMiddleware(di, eventsHandler.PostEventsByVehicle))

	// -- Eevents Types --
	mux.HandleFunc("GET /events/types", middleware.AuthMiddleware(di, enventsTypesHandler.GetEventsTypes))
	mux.HandleFunc("POST /events/types", middleware.AuthMiddleware(di, enventsTypesHandler.PostEventsTypes))
	mux.HandleFunc("DELETE /events/types/{event_type_id}", middleware.AuthMiddleware(di, enventsTypesHandler.DeleteEventsTypes))
	mux.HandleFunc("GET /events/types/categories", middleware.AuthMiddleware(di, enventsTypesHandler.GetEventsTypesCategories))

	// --- Costs ---
	mux.HandleFunc("GET /costs", middleware.AuthMiddleware(di, costsHandler.GetCosts))
	mux.HandleFunc("POST /costs", middleware.AuthMiddleware(di, costsHandler.PostCosts))
	mux.HandleFunc("GET /costs/categories", middleware.AuthMiddleware(di, costsHandler.GetCostsCategories))

	// --- Revenues ---
	mux.HandleFunc("GET /revenues", middleware.AuthMiddleware(di, revenuesHandler.GetRevenues))

	// --- Users ---
	mux.HandleFunc("GET /users", middleware.AuthMiddleware(di, usersHandler.GetUsers))
	mux.HandleFunc("POST /users", middleware.AuthMiddleware(di, usersHandler.PostUsers))
	mux.HandleFunc("GET /users/roles", middleware.AuthMiddleware(di, usersHandler.GetUsersRoles))

	// --- Documents ---
	mux.HandleFunc("GET /documents/cost", middleware.AuthMiddleware(di, documentsHandler.GetCostDocuments))
	mux.HandleFunc("GET /documents/revenue", middleware.AuthMiddleware(di, documentsHandler.GetRevenueDocuments))

	// --- Auth ---
	mux.HandleFunc("POST /auth/token", authHandler.PostToken)
	mux.HandleFunc("GET /auth/me", middleware.AuthMiddleware(di, authHandler.GetMe))

	log.Println("Server running on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
