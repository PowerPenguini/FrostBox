package di

import (
	"database/sql"
	"fmt"
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
	UserRepo          *repos.UserRepo
	DocumentRepo      *repos.DocumentRepo
	CostRepo          *repos.CostRepo
	VehicleRepo       *repos.VehicleRepo
	EventTypeRepo     *repos.EventTypeRepo
	EventRepo         *repos.EventRepo
	EventIntervalRepo *repos.EventIntervalRepo
}

type val struct {
	EventValidator         *validators.EventValidator
	EventTypeValidator     *validators.EventTypeValidator
	EventIntervalValidator *validators.EventIntervalValidator
	CostValidator          *validators.CostValidator
}

type DI struct {
	svc
	repo
	view
	val

	db         *sql.DB
	uowFactory *UnitOfWorkFactory
	tx         *sql.Tx
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
	eventIntervalRepo := repos.NewEventIntervalRepo(db)

	return &DI{
		svc: svc{
			NBPService: services.NewNBPService(),
		},
		repo: repo{
			UserRepo:          repos.NewUserRepo(db),
			VehicleRepo:       vehicleRepo,
			CostRepo:          costRepo,
			EventRepo:         eventRepo,
			EventTypeRepo:     eventTypeRepo,
			EventIntervalRepo: eventIntervalRepo,
			DocumentRepo:      documentRepo,
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
			EventValidator:         validators.NewEventValidator(vehicleRepo, costRepo, eventRepo, eventTypeRepo),
			EventTypeValidator:     validators.NewEventTypeValidator(eventTypeRepo),
			EventIntervalValidator: validators.NewEventIntervalValidator(vehicleRepo, eventIntervalRepo),
			CostValidator:          validators.NewCostValidator(eventRepo, vehicleRepo, documentRepo),
		},
		db:         db,
		uowFactory: NewUnitOfWorkFactory(db),
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

func ExecuteInTransaction[T any](d *DI, fn func(txDI *DI) (T, error)) (T, error) {
	if d.tx != nil {
		return fn(d)
	}
	tx, err := d.db.Begin()

	var zero T
	if err != nil {
		return zero, err
	}

	txDI := d.WithTx(tx)

	result, err := fn(txDI)
	if err != nil {
		tx.Rollback()
		return zero, err
	}

	if err := tx.Commit(); err != nil {
		return zero, err
	}

	return result, nil
}

func ExecuteInTransactionNoResult(d *DI, fn func(txDI *DI) error) error {
	if d.tx != nil {
		return fn(d)
	}
	tx, err := d.db.Begin()
	if err != nil {
		return err
	}

	txDI := d.WithTx(tx)

	err = fn(txDI)
	if err != nil {
		if rbErr := tx.Rollback(); rbErr != nil {
			return fmt.Errorf("rollback failed: %v, original error: %w", rbErr, err)
		}
		return err
	}

	if err = tx.Commit(); err != nil {
		return err
	}

	return nil
}

func (d *DI) WithTx(tx *sql.Tx) *DI {
	if tx == nil {
		return d
	}

	vehicleRepoTx := repos.NewVehicleRepository(tx)
	costRepoTx := repos.NewCostRepository(tx)
	eventRepoTx := repos.NewEventRepo(tx)
	eventTypeRepoTx := repos.NewEventTypeRepo(tx)
	documentRepoTx := repos.NewDocumentRepo(tx)
	eventIntervalRepoTx := repos.NewEventIntervalRepo(tx)
	userRepoTx := repos.NewUserRepo(tx)

	return &DI{
		svc: d.svc,

		repo: repo{
			UserRepo:          userRepoTx,
			VehicleRepo:       vehicleRepoTx,
			CostRepo:          costRepoTx,
			EventRepo:         eventRepoTx,
			EventTypeRepo:     eventTypeRepoTx,
			EventIntervalRepo: eventIntervalRepoTx,
			DocumentRepo:      documentRepoTx,
		},

		view: d.view,

		val: d.val,

		db:         d.db,
		uowFactory: d.uowFactory,
	}
}
