import decimal
from http.client import HTTPException
import pandas as pd
import magic
import services
import numpy as np


nbp_service = services.NBPService()
name_map = {
    "Data faktury": "invoice_date",
    "Data dostawy": "cost_date",
    "Kraj": "country",
    "Ilość": "quantity",
    "Stawka podatku VAT": "vat_rate",
    "Waluta": "currency",
    "Podatek VAT": "vat_value",
    "Rodzaj towaru": "goods_type",
    "Numer rejestracyjny samochodu": "registration_number",
    "Obrót z wyłączeniem VAT": "value",
}

ALLOWED_MIME_TYPES = {
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
}

def validate_uta_file(contents):
    mime = magic.Magic(mime=True)
    file_type = mime.from_buffer(contents[:2048])
    if file_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=422, detail=f"Niepoprawny format pliku: {file_type}"
        )


def process_file(contents):
    df = pd.read_excel(pd.io.common.BytesIO(contents), engine="openpyxl", skiprows=1)
    df.rename(columns=name_map, inplace=True)

    conditions = [
        df["goods_type"].str.startswith("Myto"),
        df["goods_type"].str.startswith("TIS PL Myto"),
        df["goods_type"].str.startswith("Winiety"),
        df["goods_type"].str.startswith("Eurowinieta"),
        df["goods_type"].str.startswith("AdBlue"),
        df["goods_type"].str.startswith("Olej napędowy"),
        df["goods_type"].str.startswith("Olej nap?dowy"),
    ]

    categories = ["toll", "toll", "toll", "toll", "additive", "fuel", "fuel"]
    df["value"] = df["value"].apply(lambda x: decimal.Decimal(str(x)))
    df["vat_value"] = df["vat_value"].apply(lambda x: decimal.Decimal(str(x)))

    df["category"] = np.select(conditions, categories, default="other")
    df["cost_date"] = pd.to_datetime(
        df["cost_date"], format="%d.%m.%Y", errors="coerce"
    )
    df["invoice_date"] = pd.to_datetime(
        df["invoice_date"], format="%d.%m.%Y", errors="coerce"
    )
    df["value_main_currency"] = df.apply(
        lambda row: nbp_service.change_to_pln(
            row["currency"], decimal.Decimal(str(row["value"])), row["invoice_date"]
        ),
        axis=1,
    )

    df["vat_value_main_currency"] = df.apply(
        lambda row: nbp_service.change_to_pln(
            row["currency"], decimal.Decimal(str(row["vat_value"])), row["invoice_date"]
        ),
        axis=1,
    )

    return df

