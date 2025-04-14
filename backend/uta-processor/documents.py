

import random
import string
import uuid
from sqlalchemy import text 


def generate_id(length):
    characters = string.ascii_uppercase + string.digits
    return "".join(random.choice(characters) for _ in range(length))


def add_document(session, source):
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
            "source": source,
        },
    )
    return document_uuid