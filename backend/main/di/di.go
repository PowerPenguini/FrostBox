package di

import (
	"database/sql"
	"frostbox/repos"
	"frostbox/services"
	"frostbox/validators"
	"frostbox/views"

	_ "github.com/jackc/pgx/v5/stdlib"
)

type svc struct {
	NBPService *services.NBPService
}

type view struct {
	DocumentViewer  *views.DocumentViewer
	VehicleViewer   *views.VehicleViewer
	UserViewer      *views.UserViewer
	AuthViewer      *views.AuthViewer
	CostViewer      *views.CostViewer
	RevenueViewer   *views.RevenueViewer
	IntervalViewer  *views.IntervalViewer
	EventViewer     *views.EventViewer
	EventTypeViewer *views.EventTypeViewer
}

type repo struct {
	UserRepo      *repos.UserRepo
	DocumentRepo  *repos.DocumentRepo
	CostRepo      *repos.CostRepo
	VehicleRepo   *repos.VehicleRepo
	EventTypeRepo *repos.EventTypeRepo
	EventRepo     *repos.EventRepo
}

type val struct {
	EventValidator     *validators.EventValidator
	EventTypeValidator *validators.EventTypeValidator
	CostValidator      *validators.CostValidator
}

type DI struct {
	svc
	repo
	view
	val
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
	documentRepo := repos.NewDocumentRepo(db)

	eventValidator := validators.NewEventValidator(vehicleRepo, costRepo, eventRepo, eventTypeRepo)

	return &DI{
		svc: svc{
			NBPService: services.NewNBPService(),
		},
		repo: repo{
			UserRepo:      repos.NewUserRepo(db),
			VehicleRepo:   vehicleRepo,
			CostRepo:      costRepo,
			EventRepo:     eventRepo,
			EventTypeRepo: eventTypeRepo,
			DocumentRepo:  documentRepo,
		},
		view: view{
			DocumentViewer:  views.NewDocumentViewer(db),
			VehicleViewer:   views.NewVehicleViewer(db),
			UserViewer:      views.NewUserViewer(db),
			AuthViewer:      views.NewAuthViewer(db),
			CostViewer:      views.NewCostViewer(db),
			RevenueViewer:   views.NewRevenueViewer(db),
			IntervalViewer:  views.NewIntervalViewer(db),
			EventViewer:     views.NewEventViewer(db),
			EventTypeViewer: views.NewEventTypeViewer(db),
		},
		val: val{
			EventValidator:     eventValidator,
			EventTypeValidator: validators.NewEventTypeValidator(eventTypeRepo),
			CostValidator:      validators.NewCostValidator(vehicleRepo, documentRepo),
		},
	}, nil
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
