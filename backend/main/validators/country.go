package validators

import "strings"

var validCurrencies = map[string]struct{}{
	// Europejskie
	"EUR": {}, "PLN": {}, "GBP": {}, "CHF": {}, "NOK": {}, "SEK": {}, "DKK": {}, "CZK": {}, "HUF": {},
	"RON": {}, "HRK": {}, "RSD": {}, "ISK": {}, "BGN": {}, "MKD": {}, "BAM": {}, "TRY": {}, "UAH": {},
	"GEL": {}, "MDL": {}, "ALL": {}, "RUB": {}, "BYN": {},

	// Popularne światowe
	"USD": {}, // dolar amerykański
	"JPY": {}, // jen japoński
	"INR": {}, // rupia indyjska
	"CNY": {}, // juan chiński
	"CAD": {}, // dolar kanadyjski
	"AUD": {}, // dolar australijski
}

func validateCountryCode(code string) bool {
	code = strings.TrimSpace(code)
	_, ok := validCountryCodes[code]
	return ok
}
