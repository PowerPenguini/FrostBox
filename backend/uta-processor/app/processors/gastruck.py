from datetime import datetime
import decimal
from http.client import HTTPException
import re
import tempfile
import pandas as pd
import magic
from app.services import NBPService
import camelot
from pdfminer.high_level import extract_text
from app import documents
from app import costs
from app.processors.base_file_processor import BaseFileProcessor

class GasTruckInvoiceProcessor(BaseFileProcessor):
    """Processor for GasTruck fuel and additive invoices"""
    
    ALLOWED_MIME_TYPES = {'application/pdf'}
    CATEGORY_MAPPING = {'ON': 'fuel', 'ADB': 'additive'}
    DATE_PATTERN = re.compile(r"\d{4}-\d{2}-\d{2}")
    OUTPUT_COLUMNS = [
        'registration_number', 
        'title', 
        'amount', 
        'value', 
        'vat_value', 
        'type', 
        'invoice_date', 
        'cost_date',
        'vat_rate',
        'value_pln',
        'vat_value_pln'
    ]

    def __init__(self):
        self.nbp_service = NBPService()

    def validate(self, contents: bytes) -> None:
        """Validate that the file is a PDF"""
        mime = magic.Magic(mime=True)
        file_type = mime.from_buffer(contents[:2048])
        if file_type not in self.ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=422, 
                detail=f"Invalid file type: {file_type}. Expected PDF."
            )

    def process(self, contents: bytes) -> pd.DataFrame:
        """Process PDF contents into structured DataFrame"""
        with tempfile.NamedTemporaryFile(suffix=".pdf") as tmp_file:
            tmp_file.write(contents)
            tmp_file.flush()
            
            # Extract and combine tables
            tables = camelot.read_pdf(tmp_file.name, pages="all", flavor="stream")
            combined_df = pd.concat([table.df for table in tables], ignore_index=True)
            
            # Clean initial table structure
            processed_df = self._clean_raw_table(combined_df)
            processed_df = self._normalize_data_structure(processed_df)
            
            # Enrich with additional data
            invoice_date = self._extract_invoice_date(tmp_file.name)
            processed_df = self._enrich_data(processed_df, invoice_date)
            
            return processed_df[self.OUTPUT_COLUMNS]

    def save_to_database(self, session, df: pd.DataFrame) -> int:
        """Save processed data to database"""
        document_id = documents.add_document(session, "GasTruck", "invoice")
        
        for _, row in df.iterrows():
            costs.add_cost(
                session=session,
                value_main_currency=row['value_pln'],
                vat_value_main_currency=row['vat_value_pln'],
                original_value=row['value'],
                registration_number=row['registration_number'],
                vat_rate=float(row['vat_rate']),
                currency='PLN',
                vat_value=row['vat_value'],
                country='PL',
                cost_date=row['cost_date'],
                invoice_date=row['invoice_date'],
                category=row['type'],
                quantity=row['amount'],
                description=row['title'],
                document_id=document_id,
                version=1
            )
        
        return document_id

    # Helper methods
    def _clean_raw_table(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean the raw extracted table"""
        df = df.iloc[:, 1:-4]  # Remove edge columns
        df = df.iloc[3:].reset_index(drop=True)  # Remove header rows
        df.replace(r"^\s*$", pd.NA, regex=True, inplace=True)
        return df.dropna(how='all')

    def _normalize_data_structure(self, df: pd.DataFrame) -> pd.DataFrame:
        """Transform the raw table structure into proper records"""
        records = []
        current_plate = None
        current_title = ""
        pending_values = None
        
        for _, row in df.iterrows():
            if pd.notna(row.iloc[0]):
                current_plate = row.iloc[0]
                continue
                
            if self._is_description_row(row):
                current_title += " " + str(row.iloc[1]).strip()
                continue
                
            if pending_values is None:
                pending_values = row
                if pd.notna(row.iloc[1]):
                    current_title += " " + str(row.iloc[1]).strip()
                continue
                
            records.append([
                current_plate,
                current_title.strip(),
                pending_values.iloc[2],  # amount
                pending_values.iloc[3],  # value
                pending_values.iloc[4],  # vat_value
                self._classify_type(pending_values.iloc[5]),  # type
            ])
            current_title = ""
            pending_values = None
            
        return pd.DataFrame(records, columns=self.OUTPUT_COLUMNS[:6])

    def _enrich_data(self, df: pd.DataFrame, invoice_date: datetime) -> pd.DataFrame:
        """Add calculated fields and clean data types"""
        df = df.copy()
        df['invoice_date'] = invoice_date
        df['cost_date'] = invoice_date
        
        # Convert to decimal
        decimal_cols = ['value', 'vat_value', 'amount']
        for col in decimal_cols:
            df[col] = df[col].apply(self._parse_decimal)
        
        # Calculate derived fields
        df['vat_rate'] = (df['vat_value'] / df['value'] * 100).apply(
            lambda x: x.quantize(decimal.Decimal('1')))
        
        df['value_pln'] = df['value']  # Already in PLN
        df['vat_value_pln'] = df['vat_value']  # Already in PLN
        
        return df

    def _is_description_row(self, row) -> bool:
        return pd.notna(row.iloc[1]) and row.iloc[2:].isna().all()

    def _parse_decimal(self, value: str) -> decimal.Decimal:
        try:
            clean_value = str(value).replace(',', '.').replace(' ', '')
            return decimal.Decimal(clean_value)
        except (decimal.InvalidOperation, ValueError):
            return decimal.Decimal('0')

    def _extract_invoice_date(self, file_path: str) -> datetime:
        text = extract_text(file_path)
        match = self.DATE_PATTERN.search(text)
        return datetime.strptime(match.group(), "%Y-%m-%d").date() if match else datetime.now().date()

    def _classify_type(self, product_code: str) -> str:
        return self.CATEGORY_MAPPING.get(product_code, 'other')