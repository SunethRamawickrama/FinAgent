from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from databases.infra.models import DataRegistry
import logging

logger = logging.getLogger(__name__)


def create_data_source(
    db: Session,
    name: str,
    source_type: str,
    userId: str,
    host: Optional[str] = None,
    port: Optional[int] = None,
    source_name: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
):
    new_source = DataRegistry(
        name=name,
        source_type=source_type,
        userId=userId,
        host=host,
        port=port,
        source_name=source_name,
        metadata_=metadata or {},
    )

    db.add(new_source)
    db.commit()
    db.refresh(new_source)

    logger.info(f"Created data source: {new_source.id} for userId={userId}")
    return new_source

def get_all_data_sources(db: Session, userId: str) -> List[DataRegistry]:
    sources = (
        db.query(DataRegistry)
        .filter(DataRegistry.userId == userId)
        .order_by(DataRegistry.created_at.desc())
        .all()
    )

    logger.info(f"Fetched {len(sources)} data sources for userId={userId}")
    return sources

def get_data_source_by_id(db: Session, source_id: str, userId: str):
    return (
        db.query(DataRegistry)
        .filter(
            DataRegistry.id == source_id,
            DataRegistry.userId == userId
        )
        .first()
    )

def get_data_source_by_name(db: Session, name: str) -> Optional[DataRegistry]:
    source = db.query(DataRegistry).filter(DataRegistry.name == name).first()

    logger.info(f"Lookup for name={name}: {source}")
    return source

def get_active_data_sources(db: Session) -> List[DataRegistry]:
    sources = db.query(DataRegistry).filter(DataRegistry.status == "active").all()

    logger.info(f"Fetched {len(sources)} active data sources")
    return sources

def update_metadata(
    db: Session,
    source_id: str,
    metadata: Dict[str, Any]
):
    source = get_data_source_by_id(db, source_id)

    if not source:
        logger.warning(f"No source found for id={source_id}")
        return None

    source.metadata_ = metadata

    db.commit()
    db.refresh(source)

    return source

def delete_data_source(db: Session, source_id: str, userId: str):
    source = get_data_source_by_id(db, source_id, userId)

    if not source:
        logger.warning(f"No source found for id={source_id}, userId={userId}")
        return False

    db.delete(source)
    db.commit()

    logger.info(f"Deleted source={source_id} for userId={userId}")
    return True

def get_data_sources_by_user(db: Session, userId: str) -> List[DataRegistry]:
    sources = (
        db.query(DataRegistry)
        .filter(DataRegistry.userId == userId)
        .order_by(DataRegistry.created_at.desc())
        .all()
    )

    logger.info(f"Fetched {len(sources)} data sources for userId={userId}")
    return sources