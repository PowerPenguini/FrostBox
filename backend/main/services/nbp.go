package services

import (
	"encoding/json"
	"fmt"
	"frostbox/errs"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/shopspring/decimal"
)

type RateResponse struct {
	Rates []struct {
		Mid decimal.Decimal `json:"mid"`
	} `json:"rates"`
}

type NBPService struct {
	cache map[string]decimal.Decimal // TODO: Store this in redis
	mu    sync.RWMutex
}

func NewNBPService() *NBPService {
	return &NBPService{
		cache: make(map[string]decimal.Decimal),
	}
}

func (s *NBPService) getRate(currencyCode string, date time.Time) (decimal.Decimal, error) { // TODO: Invalid invoice data - now-1 instead of invoice_data-1
	dateStr := date.Format("2006-01-02")
	cacheKey := fmt.Sprintf("%s_%s", currencyCode, dateStr)

	s.mu.RLock()
	if rate, found := s.cache[cacheKey]; found {
		s.mu.RUnlock()
		return rate, nil
	}
	s.mu.RUnlock()

	url := fmt.Sprintf("https://api.nbp.pl/api/exchangerates/rates/a/%s/%s?format=json", currencyCode, dateStr)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		fmt.Println(1)
		return decimal.Decimal{}, err
	}
	req.Header.Set("User-Agent", "FrostBox/NBPClient/0.1")
	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return decimal.Decimal{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		fmt.Println(url)
		fmt.Println(resp.Status)
		return decimal.Decimal{}, errs.ErrDataNotAvailable
	}

	var rateResponse RateResponse
	if err := json.NewDecoder(resp.Body).Decode(&rateResponse); err != nil {
		return decimal.Decimal{}, err
	}

	if len(rateResponse.Rates) == 0 {
		return decimal.Decimal{}, errs.ErrDataNotAvailable
	}

	midRate := rateResponse.Rates[0].Mid

	s.mu.Lock()
	s.cache[cacheKey] = midRate
	s.mu.Unlock()

	return midRate, nil
}

func (s *NBPService) ToPLN(currency string, amount decimal.Decimal, date time.Time) (decimal.Decimal, error) {
	fmt.Println(currency, amount)
	if strings.ToLower(currency) == "pln" {
		return amount, nil
	}
	rate, err := s.getRate(currency, date)

	if err != nil {
		return decimal.Decimal{}, err
	}
	return amount.Mul(rate), nil
}
