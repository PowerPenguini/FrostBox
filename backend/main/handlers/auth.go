package handlers

import (
	"encoding/json"
	"frostbox/contract"
	"frostbox/ctx"
	"frostbox/di"
	"frostbox/logic"
	"net/http"
)

type AuthHandler struct {
	di *di.DI
}

func NewAuthHandler(di *di.DI) *AuthHandler {
	return &AuthHandler{di}
}

func (h *AuthHandler) PostToken(w http.ResponseWriter, r *http.Request) {
	var req contract.PostTokenRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	params := logic.GenerateTokenParams{Email: req.Email, Password: req.Password}
	result, err := logic.GenerateToken(h.di, params)

	if err != nil {
		http.Error(w, "Failed to fetch", http.StatusInternalServerError)
		return
	}
	response := contract.PostTokenResponse{
		AccessToken: result.Token,
		TokenType:   "bearer",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *AuthHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	user, ok := ctx.GetUser(r.Context())
	if !ok || user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	resp, err := h.di.AuthVeiwer.GetUser(user.ID.String())
	if err != nil {
		http.Error(w, "Could not fetch user data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
