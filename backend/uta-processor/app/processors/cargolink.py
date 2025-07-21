from io import BytesIO
from app.revenues import add_revenue
from app.documents import add_document
from app.processors.base_file_processor import BaseFileProcessor
from app.services import NBPService
from decimal import Decimal
from fastapi import HTTPException
import magic
import pandas as pd
from app.vehicles import get_vehicle_registration_numbers
class CargoLinkIncomeReportProcessor(BaseFileProcessor):
    """Processor for UTA cost breakdown files"""

    ALLOWED_MIME_TYPES = {
        "text/csv"
    }

    COLUMN_MAPPING = {
        "Createddate": "invoice_date", # TODO: This should not be create date
        "Createddate": "revenue_date", # TODO: is this even possible??
        # "Stawka podatku VAT": "vat_rate",
        "PaymentssummaryTotalnetsummaryCurrency": "currency",
        # "Podatek VAT": "vat_value",
        "VehiclevoyageVehiclelistRegistrationno": "registration_number",
        "PaymentssummaryTotalnetsummaryAmount": "value",
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
        df = pd.read_csv(BytesIO(contents), skiprows=1)
        df.rename(columns=self.COLUMN_MAPPING, inplace=True)
        df = self._filter_vehicles(df)
        df = self._convert_currencies(df)
        return df

    def save_to_database(self, session, df: pd.DataFrame) -> int:
        document_id = add_document(session, "CargoLink", "revenue")

        for _, row in df.iterrows():
            add_revenue(
                session=session,
                value_main_currency=row["value_main_currency"],
                vat_value_main_currency=row["vat_value_main_currency"],
                value=row["value"],
                registration_number=row["registration_number"],
                vat_rate=row["vat_rate"],
                currency=row["currency"],
                vat_value=row["vat_value"],
                invoice_date=row["invoice_date"],
                revenue_date="",
                title="New revenue",
                document_id=document_id

            )

        return document_id

    def _filter_vehicles(df):
        registration_numbers = get_vehicle_registration_numbers()
        df[df['registration_number'].isin(registration_numbers)]

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
