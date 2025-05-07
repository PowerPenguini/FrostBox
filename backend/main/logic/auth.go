package logic

import (
	"frostbox/config"
	"frostbox/di"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type GenerateTokenParams struct {
	Email    string
	Password string
}

type GenerateTokenResult struct {
	Token string
}

func GenerateToken(di *di.DI, params GenerateTokenParams) (*GenerateTokenResult, error) {
	user, err := di.UserRepo.GetUserByEmail(params.Email)

	if err != nil || !verifyPassword(params.Password, user.PasswordHash) {
		return nil, err
	}

	token, err := createAccessToken(user.ID, 12*time.Hour)
	if err != nil {
		return nil, err
	}
	return &GenerateTokenResult{Token: token}, nil
}

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
	return token.SignedString(config.SecretKey)
}
