package logic

import (
	"frostbox/di"
	"frostbox/models"

	"golang.org/x/crypto/bcrypt"
)

type AddUserParams struct {
	FirstName string
	LastName  string
	Role      string
	Email     string
	Password  string
}

func AddUser(di *di.DI, params AddUserParams) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(params.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user := &models.User{
		FirstName:    params.FirstName,
		LastName:     params.LastName,
		Role:         models.UserRole(params.Role),
		Email:        params.Email,
		PasswordHash: string(hash),
	}
	return di.UserRepo.Insert(user)
}
