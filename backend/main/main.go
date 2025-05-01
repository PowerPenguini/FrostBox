package main

import (
	"encoding/json"
	"fmt"
	"frostbox/contract"
	"frostbox/di"
	"frostbox/handlers"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var secretKey = []byte("09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7") // To env or randomize

func verifyPassword(plain, hashed string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashed), []byte(plain))
	return err == nil
}

func createAccessToken(uuid uuid.UUID, expires time.Duration) (string, error) {
	claims := jwt.MapClaims{
		"sub": uuid,
		"exp": time.Now().Add(expires).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secretKey)
}

func loginHandler(di *di.DI) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req contract.TokenRequest
		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		user, err := di.UserRepo.GetUserByEmail(req.Email)
		if err != nil || !verifyPassword(req.Password, user.PasswordHash) {
			http.Error(w, "Incorrect username or password", http.StatusUnauthorized)
			return
		}

		token, err := createAccessToken(user.ID, 12*time.Hour)
		if err != nil {
			http.Error(w, "Could not generate token", http.StatusInternalServerError)
			return
		}

		resp := contract.TokenResponse{AccessToken: token, TokenType: "bearer"}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}
}

// func getUserProfile(w http.ResponseWriter, r *http.Request) {
// 	user := r.Context().Value("user").(repos.User)
// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(user)
// }

func main() {
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
	usersHandler := handlers.NewUsersHandler(di)
	intervalsHandler := handlers.NewIntervalsHandler(di)
	eventsHandler := handlers.NewEventsHandler(di)

	// --- Vehicles ---
	mux.HandleFunc("GET /vehicles", authMiddleware(di, vehiclesHandler.GetVehicles))
	mux.HandleFunc("POST /vehicles", authMiddleware(di, vehiclesHandler.PostVehicles))
	mux.HandleFunc("GET /vehicles/available", authMiddleware(di, vehiclesHandler.GetVehiclesAvailable))
	mux.HandleFunc("GET /vehicles/{vehicle_id}/intervals", authMiddleware(di, intervalsHandler.GetIntervals))
	mux.HandleFunc("GET /vehicles/{vehicle_id}/events", authMiddleware(di, eventsHandler.GetEventsByVehicle))

	mux.HandleFunc("GET /events/types", authMiddleware(di, eventsHandler.GetEventsTypes))

	// --- Costs ---
	mux.HandleFunc("GET /costs", authMiddleware(di, costsHandler.GetCosts))
	mux.HandleFunc("POST /costs", authMiddleware(di, costsHandler.PostCosts))
	mux.HandleFunc("GET /costs/categories", authMiddleware(di, costsHandler.GetCostsCategories))

	// --- Users ---
	mux.HandleFunc("GET /users", authMiddleware(di, usersHandler.GetUsers))
	mux.HandleFunc("POST /users", authMiddleware(di, usersHandler.PostUsers))
	mux.HandleFunc("GET /users/roles", authMiddleware(di, usersHandler.GetUsersRoles))

	// --- Documents ---
	mux.HandleFunc("GET /documents/cost", authMiddleware(di, documentsHandler.GetDocuments))

	// --- Auth ---
	mux.HandleFunc("POST /token", loginHandler(di))

	log.Println("Server running on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
