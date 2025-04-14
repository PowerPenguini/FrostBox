package views

import (
	"database/sql"
	"frostbox/contract"
)

type UserViewer struct {
	db *sql.DB
}

func NewUserViewer(db *sql.DB) *UserViewer {
	return &UserViewer{db: db}
}

func (r *UserViewer) GetUsers() (contract.GetUsersResponse, error) {
	query := `SELECT first_name, last_name, role, email FROM users;`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resp contract.GetUsersResponse
	for rows.Next() {
		var user contract.GetUser
		if err := rows.Scan(
			&user.FirstName,
			&user.LastName,
			&user.Role,
			&user.Email,
		); err != nil {
			return nil, err
		}
		resp = append(resp, user)
	}

	return resp, nil
}

func (r *UserViewer) GetUsersRoles() (contract.GetUsersRoles, error) {
	query := `SELECT e.enumlabel
		FROM pg_enum e
		JOIN pg_type t ON e.enumtypid = t.oid
		WHERE t.typname = 'user_role';
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var t string
	var resp contract.GetUsersRoles
	for rows.Next() {
		if err := rows.Scan(
			&t,
		); err != nil {
			return nil, err
		}
		resp = append(resp, t)
	}

	return resp, nil
}
