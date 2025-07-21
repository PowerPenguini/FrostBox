from sqlalchemy import text


def get_vehicle_registration_numbers(session):
    result = session.execute(
        text(
            """
            SELECT registration_number FROM vehicles WHERE
            """
        )
    )
    registration_numbers = [row['registration_number'] for row in result]
    return registration_numbers