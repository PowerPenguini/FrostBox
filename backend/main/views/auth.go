package views

import (
	"database/sql"
	"frostbox/contract"
)

type AuthViewer struct {
	db *sql.DB
}

func NewAuthViewer(db *sql.DB) *AuthViewer {
	return &AuthViewer{db: db}
}

func (r *AuthViewer) GetUser(userID string) (contract.GetMeResponse, error) {
	query := `SELECT first_name, last_name, role, email FROM users WHERE id = $1 LIMIT 1;`
	row := r.db.QueryRow(query, userID)

	var resp contract.GetMeResponse
	err := row.Scan(&resp.FirstName, &resp.LastName, &resp.Role, &resp.Email)
	if err != nil {
		return contract.GetMeResponse{}, err
	}

	return resp, nil
}
