package ctx

import (
	"context"
	"frostbox/models"
)

type contextKey string

const UserKey contextKey = "user"

func GetUser(ctx context.Context) (*models.User, bool) {
	user, ok := ctx.Value(UserKey).(*models.User)
	return user, ok
}
