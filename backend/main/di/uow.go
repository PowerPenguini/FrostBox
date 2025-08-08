package di

import (
	"database/sql"
	"frostbox/repos"
)

type UnitOfWorkFactory struct {
	db *sql.DB
}

func NewUnitOfWorkFactory(db *sql.DB) *UnitOfWorkFactory {
	return &UnitOfWorkFactory{db: db}
}

func (f *UnitOfWorkFactory) Create() *repos.DBUnitOfWork {
	return repos.NewDBUnitOfWork(f.db)
}
