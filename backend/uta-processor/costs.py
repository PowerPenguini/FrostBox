from sqlalchemy import text


def add_cost(
    session,
    value_main_currency,
    vat_value_main_currency,
    value,
    registration_number,
    vat_rate,
    currency,
    vat_value,
    country,
    cost_date,
    invoice_date,
    category,
    quantity,
    title,
    document_id,
    amortization
):
    session.execute(
        text(
            """
            INSERT INTO costs (value_main_currency, vat_value_main_currency, value, vehicle_id, vat_rate, currency, vat_value, country, cost_date, invoice_date, category, quantity, title, document_id, amortization)
            VALUES (:value_main_currency, :vat_value_main_currency, :value, (SELECT id FROM vehicles WHERE registration_number = :registration_number LIMIT 1), :vat_rate, :currency, :vat_value, :country, :cost_date, :invoice_date, :category, :quantity, :title, :document_id, :amortization)
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
            "country": country,
            "cost_date": cost_date,
            "invoice_date": invoice_date,
            "category": category,
            "quantity": quantity,
            "title": title, # goods_type
            "document_id": document_id,
            "amortization": amortization,
        },
    )
