package validators

import "time"

func ValidateDateBeforeOrToday(date time.Time) bool {
	today := time.Now().Truncate(24 * time.Hour)
	input := date.Truncate(24 * time.Hour)

	return !input.After(today)
}
