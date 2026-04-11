from sqlalchemy import Column, String, Integer, TIMESTAMP, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()

class DataRegistry(Base):
    __tablename__ = "data_registry"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    name = Column(String(255), nullable=False)
    source_type = Column(String(50), nullable=False)

    host = Column(String(255), nullable=True)
    port = Column(Integer, nullable=True)

    source_name = Column(String(255), nullable=True)

    status = Column(String(50), server_default="active")
    last_ping = Column(TIMESTAMP, nullable=True)

    metadata_ = Column("metadata", JSONB, nullable=True)
    userId = Column("userId", String, nullable=False)
    created_at = Column(
        TIMESTAMP,
        server_default=text("now()")
    )