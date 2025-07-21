from app.costs import add_cost
from app.documents import add_document
from app.processors.base_file_processor import BaseFileProcessor
from app.services import NBPService
from decimal import Decimal
from fastapi import HTTPException
import magic
import pandas as pd
import numpy as np

class UTACostBreakdownProcessor(BaseFileProcessor):
    """Processor for UTA cost breakdown files"""

    ALLOWED_MIME_TYPES = {
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }

    COLUMN_MAPPING = {
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

    def __init__(self):
        self.nbp_service = NBPService()  # Assuming this is defined elsewhere

    def validate(self, contents: bytes) -> None:
        mime = magic.Magic(mime=True)
        file_type = mime.from_buffer(contents[:2048])
        if file_type not in self.ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=422,
                detail=f"Invalid file format: {file_type}. Expected Excel file.",
            )

    def process(self, contents: bytes) -> pd.DataFrame:
        df = pd.read_excel(
            pd.io.common.BytesIO(contents), engine="openpyxl", skiprows=1
        )
        df.rename(columns=self.COLUMN_MAPPING, inplace=True)

        # Categorize expenses
        df = self._categorize_expenses(df)

        # Parse dates
        df = self._parse_dates(df)

        # Convert values
        df = self._convert_values(df)

        # Currency conversion
        df = self._convert_currencies(df)

        return df

    def save_to_database(self, session, df: pd.DataFrame) -> int:
        document_id = add_document(session, "UTA", "cost")

        for _, row in df.iterrows():
            add_cost(
                session=session,
                value_main_currency=row["value_main_currency"],
                vat_value_main_currency=row["vat_value_main_currency"],
                value=row["value"],
                registration_number=row["registration_number"],
                vat_rate=row["vat_rate"],
                currency=row["currency"],
                vat_value=row["vat_value"],
                country=row["country"],
                cost_date=row["cost_date"],
                invoice_date=row["invoice_date"],
                category=row["category"],
                quantity=row["quantity"],
                title=row["goods_type"],
                document_id=document_id,
                amortization=1,
            )

        return document_id

    def _categorize_expenses(self, df: pd.DataFrame) -> pd.DataFrame:
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
        df["category"] = np.select(conditions, categories, default="other")
        return df

    def _parse_dates(self, df: pd.DataFrame) -> pd.DataFrame:
        df["cost_date"] = pd.to_datetime(
            df["cost_date"], format="%d.%m.%Y", errors="coerce"
        )
        df["invoice_date"] = pd.to_datetime(
            df["invoice_date"], format="%d.%m.%Y", errors="coerce"
        )
        return df

    def _convert_values(self, df: pd.DataFrame) -> pd.DataFrame:
        df["value"] = df["value"].apply(lambda x: Decimal(str(x)))
        df["vat_value"] = df["vat_value"].apply(lambda x: Decimal(str(x)))
        return df

    def _convert_currencies(self, df: pd.DataFrame) -> pd.DataFrame:
        df["value_main_currency"] = df.apply(
            lambda row: self.nbp_service.change_to_pln(
                row["currency"], Decimal(str(row["value"])), row["invoice_date"]
            ),
            axis=1,
        )
        df["vat_value_main_currency"] = df.apply(
            lambda row: self.nbp_service.change_to_pln(
                row["currency"], Decimal(str(row["vat_value"])), row["invoice_date"]
            ),
            axis=1,
        )
        return df
