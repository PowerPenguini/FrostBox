package handlers

import (
	"encoding/json"
	"fmt"
	"frostbox/contract"
	"frostbox/di"
	"frostbox/logic"
	"net/http"
)

type UsersHandler struct {
	di *di.DI
}

func NewUsersHandler(di *di.DI) *UsersHandler {
	return &UsersHandler{di}
}

func (h *UsersHandler) GetUsers(w http.ResponseWriter, r *http.Request) {
	response, err := h.di.UserViewer.GetUsers()
	if err != nil {
		http.Error(w, "Failed to fetch", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *UsersHandler) GetUsersRoles(w http.ResponseWriter, r *http.Request) {
	response, err := h.di.UserViewer.GetUsersRoles()
	if err != nil {
		http.Error(w, "Failed to fetch", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *UsersHandler) PostUsers(w http.ResponseWriter, r *http.Request) {
	var req contract.PostUsersRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		badRequestInvalidPayload(w)
		return
	}

	params := logic.AddUserParams{
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Role:      req.Role,
		Email:     req.Email,
		Password:  req.Password,
	}
	err = logic.AddUser(h.di, params)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to add user", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
}
