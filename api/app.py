from fastapi import FastAPI, UploadFile, File, Depends, Header, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session
from databases.infra.models import Base
from databases.infra.connection import SessionLocal, engine
import databases.infra.crud as crud

from pydantic import BaseModel
from typing import Optional, Dict, Any
from contextlib import asynccontextmanager
import traceback

from agents.orchestrator.agent_runner import agent_runner

class DataSourceCreate(BaseModel):
    name: str
    source_type: str
    userId: str
    host: Optional[str] = None
    port: Optional[int] = None
    source_name: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # initialize the orchestrator agent 
    await agent_runner.initialize()
    yield
    # clean up agent conversation
    await agent_runner.cleanup()

app = FastAPI(lifespan=lifespan)

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

@app.post("/api/add_db")
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

@app.get("/api/data-sources")
def get_user_data_sources(userId: str, db: Session = Depends(get_db)):
    try:
        sources = crud.get_data_sources_by_user(db, userId)

        return {
            "count": len(sources),
            "data_sources": [
                {
                    "id": str(s.id),
                    "name": s.name,
                    "source_type": s.source_type,
                    "host": s.host,
                    "port": s.port,
                    "source_name": s.source_name,
                    "status": s.status,
                    "metadata": s.metadata_,
                    "created_at": s.created_at.isoformat() if s.created_at else None
                }
                for s in sources
            ]
        }

    except Exception as e:
        return JSONResponse(
            content={"message": f"Error: {str(e)}"},
            status_code=500
        )
    
class QueryRequest(BaseModel):
    message:      str
    keep_history: bool = True 

class QueryResponse(BaseModel):
    response: str

@app.post("/api/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    result = await agent_runner.query(
        task=request.message,
        keep_history=request.keep_history
    )
    return QueryResponse(response=result)

@app.post("/api/reset")
async def reset():
    await agent_runner.reset()
    return {"status": "history cleared"}

@app.get("/api/health")
async def health():
    return {"status": "ok", "agent_ready": agent_runner.agent is not None}