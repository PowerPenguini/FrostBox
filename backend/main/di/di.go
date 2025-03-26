package di

import (
	"database/sql"
	"voltdesk/repos"

	_ "github.com/jackc/pgx/v5/stdlib"
)

type DI struct {
	UserRepo     *repos.UserRepo
	DocumentRepo *repos.DocumentRepo
}

func NewDatabase(connStr string) (*sql.DB, error) {
	db, err := sql.Open("pgx", connStr)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	return db, nil
}

func NewDI(connStr string) (*DI, error) {
	db, err := NewDatabase(connStr)
	if err != nil {
		return nil, err
	}

	return &DI{
		repos.NewUserRepo(db),
		repos.NewDocumentRepo(db),
	}, nil
}
