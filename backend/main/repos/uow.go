package repos

import "database/sql"

type DBUnitOfWork struct {
	db *sql.DB
	tx *sql.Tx
}

func NewDBUnitOfWork(db *sql.DB) *DBUnitOfWork {
	return &DBUnitOfWork{db: db}
}

func (uow *DBUnitOfWork) Begin() error {
	var err error
	uow.tx, err = uow.db.Begin()
	return err
}

func (uow *DBUnitOfWork) Commit() error {
	return uow.tx.Commit()
}

func (uow *DBUnitOfWork) Rollback() error {
	return uow.tx.Rollback()
}

func (uow *DBUnitOfWork) GetTx() *sql.Tx {
	return uow.tx
}
