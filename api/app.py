from fastapi import FastAPI, UploadFile, File, Depends, Header, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session
from databases.infra.models import Base
from databases.infra.connection import SessionLocal, engine
import databases.infra.crud as crud

from pydantic import BaseModel
from typing import Optional, Dict, Any
import traceback

class DataSourceCreate(BaseModel):
    name: str
    source_type: str
    userId: str
    host: Optional[str] = None
    port: Optional[int] = None
    source_name: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://192.168.0.134:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/add_source")
def add_source(payload: DataSourceCreate, db: Session = Depends(get_db)):
    try:
        new_source = crud.create_data_source(
            db=db,
            name=payload.name,
            source_type=payload.source_type,
            userId=payload.userId,
            host=payload.host,
            port=payload.port,
            source_name=payload.source_name,
            metadata=payload.metadata,
        )

        return {
            "message": "Source added successfully",
            "data": {
                "id": str(new_source.id),
                "name": new_source.name,
                "userId": new_source.userId,
                "source_type": new_source.source_type,
                "host": new_source.host,
                "port": new_source.port,
                "metadata": new_source.metadata_
            }
        }

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"message": str(e)}
        )