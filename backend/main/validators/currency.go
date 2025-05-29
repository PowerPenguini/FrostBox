package validators

import (
	"strings"
)

var validCountryCodes = map[string]struct{}{
	// Europa
	"ALB": {}, "AND": {}, "ARM": {}, "AUT": {}, "AZE": {}, "BLR": {}, "BEL": {}, "BIH": {}, "BGR": {}, "HRV": {},
	"CYP": {}, "CZE": {}, "DNK": {}, "EST": {}, "FIN": {}, "FRA": {}, "GEO": {}, "DEU": {}, "GRC": {}, "HUN": {},
	"ISL": {}, "IRL": {}, "ITA": {}, "KAZ": {}, "XKX": {}, "LVA": {}, "LIE": {}, "LTU": {}, "LUX": {}, "MLT": {},
	"MDA": {}, "MCO": {}, "MNE": {}, "NLD": {}, "MKD": {}, "NOR": {}, "POL": {}, "PRT": {}, "ROU": {}, "RUS": {},
	"SMR": {}, "SRB": {}, "SVK": {}, "SVN": {}, "ESP": {}, "SWE": {}, "CHE": {}, "TUR": {}, "UKR": {}, "GBR": {},
	"VAT": {},

	// Popularne poza Europą
	"USA": {}, "CAN": {}, "MEX": {}, "BRA": {}, "ARG": {}, "CHL": {}, "AUS": {}, "NZL": {}, "JPN": {}, "CHN": {},
	"IND": {}, "KOR": {}, "SGP": {}, "HKG": {}, "ZAF": {}, "EGY": {}, "ARE": {}, "SAU": {}, "ISR": {}, "THA": {},
	"MYS": {}, "IDN": {},
}

func validateCurrency(code string) bool {
	code = strings.ToUpper(strings.TrimSpace(code))
	_, ok := validCurrencies[code]
	return ok
}
