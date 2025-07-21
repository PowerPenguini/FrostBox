import random
import string
import uuid
from sqlalchemy import text


def generate_id(length):
    characters = string.ascii_uppercase + string.digits
    return "".join(random.choice(characters) for _ in range(length))


def add_document(session, source, type):
    document_uuid = uuid.uuid4()
    readable_id = generate_id(8)

    session.execute(
        text(
            """
            INSERT INTO documents (id, readable_id, status, source, type)
            VALUES (:id, :readable_id, :status, :source, :type);
            """
        ),
        {
            "id": document_uuid,
            "readable_id": readable_id,
            "status": "added",
            "source": source,
            "type": type,
        },
    )
    return document_uuid
