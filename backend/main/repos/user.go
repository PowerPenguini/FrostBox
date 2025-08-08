package repos

import (
	"frostbox/models"

	"github.com/google/uuid"
)

type UserRepo struct {
	db DBTX
}

func NewUserRepo(db DBTX) *UserRepo {
	return &UserRepo{db: db}
}

func (r *UserRepo) Insert(user *models.User) error {
	query := `INSERT INTO users (first_name, last_name, role, email, password_hash)
		VALUES ($1, $2, $3, $4, $5)`
	_, err := r.db.Exec(query,
		user.FirstName,
		user.LastName,
		user.Role,
		user.Email,
		user.PasswordHash,
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

func (r *UserRepo) DeleteUser(id uuid.UUID) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}
