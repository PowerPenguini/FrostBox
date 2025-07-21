from typing import Dict, Type
from app import processors
from app.processors import BaseFileProcessor
from fastapi import HTTPException, FastAPI, File, Form, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import os

conn_str = (
    f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@"
    f"{os.getenv('POSTGRES_HOST')}:{os.getenv('POSTGRES_PORT')}/"
    f"{os.getenv('POSTGRES_DB')}?sslmode=disable"
)

engine = create_engine(conn_str)
Session = sessionmaker(bind=engine)

app = FastAPI()

class FileProcessorFactory:
    """Factory to create appropriate file processors"""
    
    _processors: Dict[tuple, Type[BaseFileProcessor]] = {
        ("uta", "cost_breakdown"): processors.UTACostBreakdownProcessor,
        ("gastruck", "cars_invoice"): processors.GasTruckInvoiceProcessor,
        ("cargolink", "income_report"): processors.CargoLinkIncomeReportProcessor,
    }
    
    @classmethod
    def get_processor(cls, source: str, file_type: str) -> BaseFileProcessor:
        try:
            processor_class = cls._processors[(source, file_type)]
            return processor_class()
        except KeyError:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {file_type} for source: {source}"
            )

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...), 
    type: str = Form(...), 
    source: str = Form(...)
):
    session = Session()
    try:
        contents = await file.read()
        
        # Get appropriate processor
        processor = FileProcessorFactory.get_processor(source, type)
        
        # Validate and process file
        processor.validate(contents)
        df = processor.process(contents)
        
        # Save to database
        document_id = processor.save_to_database(session, df)
        
        session.commit()
        return JSONResponse(
            content={
                "message": "File processed successfully",
                "document_id": document_id
            }
        )
        
    except HTTPException:
        raise  # Re-raise FastAPI HTTP exceptions
    except Exception as e:
        session.rollback()
        print(e)
        raise HTTPException(
            status_code=500,
            detail=f"Error processing file: {str(e)}"
        )
    finally:
        session.close()
        await file.close()

