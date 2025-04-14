package di

import (
	"database/sql"
	"frostbox/repos"
	"frostbox/services"
	"frostbox/views"

	_ "github.com/jackc/pgx/v5/stdlib"
)

type DI struct {
	UserRepo       *repos.UserRepo
	DocumentRepo   *repos.DocumentRepo
	CostRepo       *repos.CostRepo
	VehicleRepo    *repos.VehicleRepo
	DocumentViewer *views.DocumentViewer
	VehicleViewer  *views.VehicleViewer
	UserVeiwer     *views.UserViewer
	CostViewer     *views.CostViewer
	NBPService     *services.NBPService
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
		repos.NewCostRepository(db),
		repos.NewVehicleRepository(db),
		views.NewDocumentViewer(db),
		views.NewVehicleViewer(db),
		views.NewUserViewer(db),
		views.NewCostViewer(db),
		services.NewNBPService(),
	}, nil
}
