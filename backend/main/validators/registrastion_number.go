package validators

import (
	"regexp"
	"strings"
	"unicode"
)

func ValidatePLRegistrationNumber(s string) bool {
	cleaned := strings.ToUpper(strings.TrimSpace(s))
	cleaned = strings.Map(func(r rune) rune {
		if unicode.IsSpace(r) {
			return -1
		}
		return r
	}, cleaned)

	re := regexp.MustCompile(`^[A-Z]{1,3}[0-9A-Z]{1,5}$`)
	return re.MatchString(cleaned)
}
