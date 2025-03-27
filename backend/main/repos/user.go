package repos

import (
	"database/sql"
	"frostbox/models"
	"time"

	"github.com/google/uuid"
)

type UserRepo struct {
	db *sql.DB
}

func NewUserRepo(db *sql.DB) *UserRepo {
	return &UserRepo{db: db}
}

func (r *UserRepo) CreateUser(user *models.User) error {
	query := `INSERT INTO users (id, first_name, last_name, role, email, password_hash, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err := r.db.Exec(query,
		user.ID,
		user.FirstName,
		user.LastName,
		user.Role,
		user.Email,
		user.PasswordHash,
		user.CreatedAt,
		user.UpdatedAt,
	)
	return err
}

func (r *UserRepo) GetUserByID(id uuid.UUID) (*models.User, error) {
	query := `SELECT id, first_name, last_name, role, email, password_hash, created_at, updated_at FROM users WHERE id = $1`
	row := r.db.QueryRow(query, id)

	user := &models.User{}
	if err := row.Scan(
		&user.ID,
		&user.FirstName,
		&user.LastName,
		&user.Role,
		&user.Email,
		&user.PasswordHash,
		&user.CreatedAt,
		&user.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return user, nil
}

func (r *UserRepo) GetUserByEmail(email string) (*models.User, error) {
	query := `SELECT id, first_name, last_name, role, email, password_hash, created_at, updated_at FROM users WHERE email = $1`
	row := r.db.QueryRow(query, email)

	user := &models.User{}
	if err := row.Scan(
		&user.ID,
		&user.FirstName,
		&user.LastName,
		&user.Role,
		&user.Email,
		&user.PasswordHash,
		&user.CreatedAt,
		&user.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return user, nil
}

func (r *UserRepo) UpdateUser(user *models.User) error {
	query := `UPDATE users SET first_name=$1, last_name=$2, role=$3, email=$4, password_hash=$5, updated_at=$6 WHERE id=$7`
	_, err := r.db.Exec(query,
		user.FirstName,
		user.LastName,
		user.Role,
		user.Email,
		user.PasswordHash,
		time.Now(),
		user.ID,
	)
	return err
}

func (r *UserRepo) DeleteUser(id uuid.UUID) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *UserRepo) GetAllUsers() ([]models.User, error) {
	query := `SELECT id, first_name, last_name, role, email, password_hash, created_at, updated_at FROM users`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		if err := rows.Scan(
			&user.ID,
			&user.FirstName,
			&user.LastName,
			&user.Role,
			&user.Email,
			&user.PasswordHash,
			&user.CreatedAt,
			&user.UpdatedAt,
		); err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}
