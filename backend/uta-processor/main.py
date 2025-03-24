import os
import zipfile
import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import numpy as np
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse

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

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        df = pd.read_excel(pd.io.common.BytesIO(contents), engine="openpyxl", skiprows=1)
        df.rename(columns=name_map, inplace=True)

        conditions = [
            df["goods_type"].str.startswith("Myto"),
            df["goods_type"].str.startswith("TIS PL Myto"),
            df["goods_type"].str.startswith("Winiety"),
            df["goods_type"].str.startswith("Eurowinieta"),
            df["goods_type"].str.startswith("AdBlue"),
            df["goods_type"].str.startswith("Olej napędowy"),
        ]
        
        categories = ["toll", "toll", "toll", "toll", "additives", "fuel"]

        df["category"] = np.select(conditions, categories, default="other")
        df["source"] = "uta"
        df['cost_date'] = pd.to_datetime(df['cost_date'], format='%d.%m.%Y', errors='coerce')
        df['invoice_date'] = pd.to_datetime(df['invoice_date'], format='%d.%m.%Y', errors='coerce')

        session = Session()
        try:
            for _, row in df.iterrows():
                session.execute(
                    text("""
                        INSERT INTO costs (value, source, car_id, vat_rate, currency, vat_value, country, cost_date, invoice_date, category, quantity, title)
                        VALUES (:value, :source, (SELECT id FROM vehicles WHERE registration_number = :registration_number LIMIT 1), :vat_rate, :currency, :vat_value, :country, :cost_date, :invoice_date, :category, :quantity, :title)
                    """),
                    {
                        'value': row['value'],
                        'source': row['source'],
                        'registration_number': row['registration_number'],
                        'vat_rate': row['vat_rate'],
                        'currency': row['currency'],
                        'vat_value': row['vat_value'],
                        'country': row['country'],
                        'cost_date': row['cost_date'],
                        'invoice_date': row['invoice_date'],
                        'category': row['category'],
                        'quantity': row['quantity'],
                        'title': row["goods_type"]
                    }
                )
            session.commit()
            return JSONResponse(content={"message": "File processed and data inserted successfully."})
        except Exception as e:
            session.rollback()
            return JSONResponse(content={"error": f"Error during transaction: {str(e)}"}, status_code=500)
        finally:
            session.close()

    except (KeyError, zipfile.BadZipFile) as _:
        return JSONResponse(content={"error": "Incorrect file format"}, status_code=422)
