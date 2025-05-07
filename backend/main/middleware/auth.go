package middleware

import (
	"context"
	"frostbox/config"
	"frostbox/ctx"
	"frostbox/di"
	"net/http"
	"strings"

	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
)

func AuthMiddleware(di *di.DI, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Missing Authorization header", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return config.SecretKey, nil
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

		idStr, ok := claims["sub"].(string)
		if !ok {
			http.Error(w, "Invalid user ID type", http.StatusUnauthorized)
			return
		}

		id, err := uuid.Parse(idStr)
		if err != nil {
			http.Error(w, "Invalid user ID format", http.StatusUnauthorized)
			return
		}

		user, err := di.UserRepo.GetUserByID(id)
		if err != nil {
			http.Error(w, "User not found or inactive", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), ctx.UserKey, user)
		next(w, r.WithContext(ctx))
	}
}
