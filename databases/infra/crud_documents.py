from sqlalchemy.orm import Session
from typing import List, Optional
from databases.infra.models import Document
import logging

logger = logging.getLogger(__name__)


def create_document(
    db: Session,
    user_id: str,
    file_name: str,
    page_count: int,
    original_text: str,
    storage_path: str = None
):
    doc = Document(
        user_id=user_id,
        file_name=file_name,
        page_count=page_count,
        original_text=original_text,
        storage_path=storage_path
    )

    db.add(doc)
    db.commit()
    db.refresh(doc)

    return doc


def get_all_documents(db: Session, user_id: str) -> List[Document]:
    return db.query(Document)\
        .filter(Document.user_id == user_id)\
        .order_by(Document.created_at.desc())\
        .all()


def get_document_by_id(db: Session, doc_id: str) -> Optional[Document]:
    return db.query(Document)\
        .filter(Document.id == doc_id)\
        .first()

def get_document_by_name(db: Session, doc_name: str) -> Optional[Document]:
    return db.query(Document)\
        .filter(Document.file_name == doc_name)\
        .first()

def get_documents_by_user(db: Session, user_id: str):
    return db.query(Document).filter(
        Document.user_id == user_id
    ).all()