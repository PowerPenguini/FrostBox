package validators

func validateCostCategory(category string) bool {
	validCategories := map[string]struct{}{
		"fuel":     {},
		"additive": {},
		"toll":     {},
		"service":  {},
		"other":    {},
	}

	_, valid := validCategories[category]
	return valid
}
