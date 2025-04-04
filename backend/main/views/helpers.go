package views

import "github.com/shopspring/decimal"

func roundUp(num decimal.Decimal) string {
	return num.RoundUp(2).StringFixed(2)
}
