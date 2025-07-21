from sqlalchemy import text

def add_revenue(
    session,
    value_main_currency,
    vat_value_main_currency,
    value,
    registration_number,
    vat_rate,
    currency,
    vat_value,
    invoice_date,
    revenue_date,
    title,
    document_id
):
    session.execute(
        text(
            """
            INSERT INTO revenues (
                value_main_currency,
                vat_value_main_currency,
                value,
                vehicle_id,
                vat_rate,
                currency,
                vat_value,
                invoice_date,
                revenue_date,
                title,
                document_id
            )
            VALUES (
                :value_main_currency,
                :vat_value_main_currency,
                :value,
                (SELECT id FROM vehicles WHERE registration_number = :registration_number LIMIT 1),
                :vat_rate,
                :currency,
                :vat_value,
                :invoice_date,
                :revenue_date,
                :title,
                :document_id
            )
            """
        ),
        {
            "value_main_currency": value_main_currency,
            "vat_value_main_currency": vat_value_main_currency,
            "value": value,
            "registration_number": registration_number,
            "vat_rate": vat_rate,
            "currency": currency,
            "vat_value": vat_value,
            "invoice_date": invoice_date,
            "revenue_date": revenue_date,
            "title": title,
            "document_id": document_id,
        },
    )
