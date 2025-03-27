package main

import (
	"frostbox/di"
	"net/http"
	"strings"

	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
	"golang.org/x/net/context"
)

func authMiddleware(di *di.DI, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Missing Authorization header", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return secretKey, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || claims["sub"] == nil {
			http.Error(w, "Invalid token claims", http.StatusUnauthorized)
			return
		}

		id, err := uuid.Parse(claims["sub"].(string))
		if err != nil {
			http.Error(w, "Invalid user id", http.StatusUnauthorized)
			return
		}

		user, err := di.UserRepo.GetUserByID(id)
		if err != nil {
			http.Error(w, "User not found or inactive", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), "user", user)
		next(w, r.WithContext(ctx))
	}
}
