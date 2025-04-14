import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
import documents
import uta
import costs
import gastruck
app = FastAPI()

conn_str = (
    f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@"
    f"{os.getenv('POSTGRES_HOST')}:{os.getenv('POSTGRES_PORT')}/"
    f"{os.getenv('POSTGRES_DB')}?sslmode=disable"
)

engine = create_engine(conn_str)
Session = sessionmaker(bind=engine)


async def process_uta_cost_breakdown(file):
    session = Session()
    contents = await file.read()
    try:
        pdf_data = uta.process_file(contents)
        document_id = documents.add_document(session, "UTA")
        for _, row in pdf_data.iterrows():
            costs.add_cost(
                session,
                row["value_main_currency"],
                row["vat_value_main_currency"],
                row["value"],
                row["registration_number"],
                row["vat_rate"],
                row["currency"],
                row["vat_value"],
                row["country"],
                row["cost_date"],
                row["invoice_date"],
                row["category"],
                row["quantity"],
                row["goods_type"],
                document_id,
                1,
            )
        session.commit()
    except Exception as e:
        print("session rollback")
        session.rollback()
        raise e
    finally:
        session.close()

async def process_gastruck_invoice(file):
    session = Session()
    contents = await file.read()
    try:
        pdf_data = gastruck.process_file(contents)
        document_id = documents.add_document(session, "GasTruck")
        for _, row in pdf_data.iterrows():
            costs.add_cost(
                session,
                row["value_main_currency"],
                row["vat_value_main_currency"],
                row["value"],
                row["registration_number"],
                row["vat_rate"],
                row["currency"],
                row["vat_value"],
                row["country"],
                row["cost_date"],
                row["invoice_date"],
                row["category"],
                row["quantity"],
                row["goods_type"],
                document_id,
                1,
            )
        session.commit()
        return JSONResponse(
            content={"message": "File processed and data inserted successfully."}
        )
    except Exception as e:
        print("session rollback")
        session.rollback()
        raise e
    finally:
        session.close()


processing_map = {
    ("uta", "cost_breakdown"): process_uta_cost_breakdown,
    ("gastruck", "cars_invoice"): process_uta_cost_breakdown,
}


@app.post("/upload")
async def upload_uta(
    file: UploadFile = File(...), type: str = Form(...), source: str = Form(...)
):
    try:
        await processing_map[(source, type)](file)
    except Exception as e:
        print(e)
        return JSONResponse(
            content={"error": f"Unsupported tile type"},
            status_code=500,
        )