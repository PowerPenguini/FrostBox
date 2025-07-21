package di

import (
	"database/sql"
	"frostbox/repos"
	"frostbox/services"
	"frostbox/validators"
	"frostbox/views"

	_ "github.com/jackc/pgx/v5/stdlib"
)

type DI struct {
	UserRepo       *repos.UserRepo
	DocumentRepo   *repos.DocumentRepo
	CostRepo       *repos.CostRepo
	VehicleRepo    *repos.VehicleRepo
	EventTypeRepo  *repos.EventTypeRepo
	EventRepo      *repos.EventRepo
	DocumentViewer *views.DocumentViewer
	VehicleViewer  *views.VehicleViewer
	UserViewer     *views.UserViewer
	AuthViewer     *views.AuthViewer
	CostViewer     *views.CostViewer
	RevenueViewer  *views.RevenueViewer
	IntervalViewer *views.IntervalViewer
	EventViewer    *views.EventViewer
	NBPService     *services.NBPService
	EventValidator *validators.EventValidator
	CostValidator  *validators.CostValidator
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

	vehicleRepo := repos.NewVehicleRepository(db)
	costRepo := repos.NewCostRepository(db)
	eventRepo := repos.NewEventRepo(db)
	eventTypeRepo := repos.NewEventTypeRepo(db)

	eventValidator := validators.NewEventValidator(vehicleRepo, costRepo, eventRepo, eventTypeRepo)

	return &DI{
		UserRepo:       repos.NewUserRepo(db),
		VehicleRepo:    vehicleRepo,
		CostRepo:       costRepo,
		EventRepo:      eventRepo,
		EventTypeRepo:  eventTypeRepo,
		EventValidator: eventValidator,
		DocumentViewer: views.NewDocumentViewer(db),
		VehicleViewer:  views.NewVehicleViewer(db),
		UserViewer:     views.NewUserViewer(db),
		AuthViewer:     views.NewAuthViewer(db),
		CostViewer:     views.NewCostViewer(db),
		RevenueViewer:  views.NewRevenueViewer(db),
		IntervalViewer: views.NewIntervalViewer(db),
		EventViewer:    views.NewEventViewer(db),
		NBPService:     services.NewNBPService(),
	}, nil
}
