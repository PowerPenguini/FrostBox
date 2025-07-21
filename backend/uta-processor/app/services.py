from datetime import date
import requests
import decimal

class ExchangeRateError(Exception):
    pass

class NBPService:
    def __init__(self):
        self.cache = {}

    def _get_rate(self, currency_code, date):
        date_str = date.strftime("%Y-%m-%d")
        cache_key = (currency_code.lower(), date_str)

        # Check if the rate is already in the cache
        if cache_key in self.cache:
            return self.cache[cache_key]

        url = f"https://api.nbp.pl/api/exchangerates/rates/a/{currency_code.lower()}/{date_str}/?format=json"
        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            
            if 'rates' not in data or not data['rates']:
                raise ExchangeRateError("No rates found in the response.")

            mid_rate = data['rates'][0]['mid']
            # Store the rate in the cache
            self.cache[cache_key] = mid_rate
            return mid_rate

        except requests.exceptions.RequestException as e:
            raise ExchangeRateError(f"API request failed: {e}")
        except ValueError as e:
            raise ExchangeRateError(f"Error parsing JSON response: {e}")

    def change_to_pln(self, currency: str, amount: decimal.Decimal, date: date):
        try:
            rate = self._get_rate(currency, date)
            amount_in_pln = amount * decimal.Decimal(str(rate))
            return amount_in_pln
        except ExchangeRateError as e:
            raise ExchangeRateError(f"Failed to convert currency: {e}")

