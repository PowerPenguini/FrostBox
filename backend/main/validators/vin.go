package validators

import (
	"strings"
)

var transliteration = map[rune]int{
	'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
	'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9,
	'S': 2, 'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9,
	'0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
}

var weights = []int{8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2}

func ValidateVIN(vin string) bool {
	if len(vin) != 17 {
		return false
	}
	vin = strings.ToUpper(vin)

	sum := 0
	for i, char := range vin {
		val, ok := transliteration[char]
		if !ok {
			return false
		}
		sum += val * weights[i]
	}

	checkDigit := vin[8]
	remainder := sum % 11
	expected := byte('0' + remainder)
	if remainder == 10 {
		expected = 'X'
	}
	return checkDigit == expected
}
