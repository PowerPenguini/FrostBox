from datetime import datetime
import decimal
from http.client import HTTPException
from pprint import pprint
import re
import shutil
import tempfile
import pandas as pd
import magic
import services
import numpy as np
from io import BytesIO
import camelot
from pdfminer.high_level import extract_text


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


def process_file(file):
    with tempfile.NamedTemporaryFile(delete=True, suffix=".pdf") as tmp:
        tmp.write(file)
        tmp.flush()
        date = _extract_date(tmp.name)

        raw_tables = []
        tables = camelot.read_pdf(tmp.name, pages="all", flavor="stream")

        for table in tables:
            df = table.df
            raw_tables.append(df)

        df = pd.concat(raw_tables, ignore_index=True)

        df = df.iloc[:, 1:-4]
        df = df.iloc[3:].reset_index(drop=True)
        df.replace(r"^\s*$", pd.NA, regex=True, inplace=True)
        df = df.dropna(how="all")

        df = _normalize_dataframe(df)
        df = _assign_category(df)
        df = _assign_dates(df, date)
        df = _assign_column_names(df)
        df = _convert_decimals(df)
        df = _add_vat_rate(df)
        

        return df


def _normalize_dataframe(df):
    current_licence_plate = None
    df_new = pd.DataFrame()
    for i, row in df.iterrows():
        value = row.iloc[0]
        if pd.notna(value) and str(value).strip():
            current_licence_plate = row.iloc[0]
            continue
        data_row = [current_licence_plate] + row.iloc[1:].tolist()
        df_app = pd.DataFrame(
            [data_row],
        )
        df_new = pd.concat([df_new, df_app], ignore_index=True)

    df = df_new
    df_new = pd.DataFrame()

    current_title = ""
    values = None
    amounts_found = False
    first_desc_found = False
    rows_to_drop = []
    for idx, row in df.iterrows():
        desc = row.iloc[1]
        desc_row = pd.notna(desc) and row.iloc[2:].isna().all()
        if amounts_found and not desc_row:
            amounts_found = False
            first_desc_found = False
            data_row = [values.iloc[0], current_title] + values.iloc[2:].tolist()
            df_app = pd.DataFrame([data_row])
            df_new = pd.concat([df_new, df_app], ignore_index=True)

        if desc_row:
            current_title += desc + " "
            first_desc_found = True
            rows_to_drop.append(idx)

        if not desc_row and first_desc_found:
            if not pd.isna(desc):
                current_title += desc + " "
            values = row
            amounts_found = True
            rows_to_drop.append(idx)

    df = df.drop(index=rows_to_drop).reset_index(drop=True)
    df = pd.concat([df, df_new], ignore_index=True)

    return df


def _classify_type(row):
    type_map = {
        "ON": "fuel",
        "ADB": "additive",
    }
    return type_map.get(row[1], "other")


def _assign_category(df):
    df["type"] = df.apply(_classify_type, axis=1)
    return df


def _extract_date(path):
    text = extract_text(path)
    lines = text.strip().split("\n")
    pattern = r"\d{4}-\d{2}-\d{2}"
    match = re.search(pattern, lines[4])

    if match:
        date_str = match.group(0)
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        return date_obj
    else:
        return None


def _assign_dates(df, date):
    df["invoice_date"] = date
    df["cost_date"] = date
    return df


def _assign_column_names(df):
    df.columns = ["registration_number", "title", "amount", "value", "vat_value", "type", "invoice_date", "cost_date"]
    return df

def to_decimal(value):
    try:
        value = value.replace(',', '.')
        value = value.replace(' ', '')
        return decimal.Decimal(value)
    except (decimal.InvalidOperation, ValueError):
        return None 

def _convert_decimals(df): 
    df['vat_value'] = df['vat_value'].apply(to_decimal)
    df['value'] = df['value'].apply(to_decimal)
    df['amount'] = df['amount'].apply(to_decimal)
    return df

def _add_vat_rate(df):
    df["vat_rate"] = df["vat_value"] / df["value"] * 100
    df['vat_rate'] = df['vat_rate'].apply(lambda x: x.quantize(decimal.Decimal('1')))
    return df

