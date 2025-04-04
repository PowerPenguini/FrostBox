from datetime import date, timedelta
import decimal
from http.client import HTTPException
import os
import random
import string
import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import numpy as np
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import uuid
import magic
import services

nbp_service = services.NBPService()
app = FastAPI()

conn_str = (
    f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@"
    f"{os.getenv('POSTGRES_HOST')}:{os.getenv('POSTGRES_PORT')}/"
    f"{os.getenv('POSTGRES_DB')}?sslmode=disable"
)

engine = create_engine(conn_str)
Session = sessionmaker(bind=engine)

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

ALLOWED_MIME_TYPES = {"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}

def validate_file(contents):
    mime = magic.Magic(mime=True)
    file_type = mime.from_buffer(contents[:2048])
    if file_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=422, detail=f"Niepoprawny format pliku: {file_type}")

def process_pdf(contents):
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
    df['value'] = df['value'].apply(lambda x: decimal.Decimal(str(x)))
    df['vat_value'] = df['vat_value'].apply(lambda x: decimal.Decimal(str(x)))

    df["category"] = np.select(conditions, categories, default="other")
    df["source"] = "uta"
    df["cost_date"] = pd.to_datetime(
        df["cost_date"], format="%d.%m.%Y", errors="coerce"
    )
    df["invoice_date"] = pd.to_datetime(
        df["invoice_date"], format="%d.%m.%Y", errors="coerce"
    )
    df["value_main_currency"] = df.apply(
        lambda row: nbp_service.change_to_pln(row["currency"], decimal.Decimal(str(row["value"])), row["invoice_date"]),
        axis=1
    )

    df["vat_value_main_currency"] = df.apply(
        lambda row: nbp_service.change_to_pln(row["currency"], decimal.Decimal(str(row["vat_value"])), row["invoice_date"]),
        axis=1
    )

    return df


@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    session = Session()
    contents = await file.read()
    try:
        pdf_data = process_pdf(contents)
        uuid = add_document() # TODO: add document even if inceorrect
        for _, row in pdf_data.iterrows():
            session.execute(
                text(
                    """
                    INSERT INTO costs (value_main_currency, vat_value_main_currency, value, source, vehicle_id, vat_rate, currency, vat_value, country, cost_date, invoice_date, category, quantity, title, document_id)
                    VALUES (:value_main_currency, :vat_value_main_currency, :value, :source, (SELECT id FROM vehicles WHERE registration_number = :registration_number LIMIT 1), :vat_rate, :currency, :vat_value, :country, :cost_date, :invoice_date, :category, :quantity, :title, :document_id)
                    """
                ),
                {
                    "value_main_currency": row["value_main_currency"],
                    "vat_value_main_currency": row["vat_value_main_currency"],
                    "value": row["value"],
                    "source": row["source"],
                    "registration_number": row["registration_number"],
                    "vat_rate": row["vat_rate"],
                    "currency": row["currency"],
                    "vat_value": row["vat_value"],
                    "country": row["country"],
                    "cost_date": row["cost_date"],
                    "invoice_date": row["invoice_date"],
                    "category": row["category"],
                    "quantity": row["quantity"],
                    "title": row["goods_type"],
                    "document_id": uuid,
                },
            )
        session.commit()
        return JSONResponse(
            content={"message": "File processed and data inserted successfully."}
        )
    # except Exception as e:
    #     session.rollback()
    #     return JSONResponse(
    #         content={"error": f"Error during transaction: {str(e)}"},
    #         status_code=500,
    #     )
    finally:
        session.close()


def generate_id(length):
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choice(characters) for _ in range(length))


def add_document():
    session = Session()
    document_uuid = uuid.uuid4()
    readable_id = generate_id(8)

    session.execute(
        text(
            """
            INSERT INTO documents (id, readable_id, status, source)
            VALUES (:id, :readable_id, :status, :source);
            """
        ),
        {
            "id": document_uuid,
            "readable_id": readable_id,
            "status": "added",
            "source": "UTA",
        },
    )
    session.commit()
    return document_uuid

@app.post("/rate/")
def rates(rate_request: dict):
    eur = rate_request["a"]
    a = nbp_service.change_to_pln("EUR", decimal.Decimal(eur), date.today() - timedelta(days=1))
    return a