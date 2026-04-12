from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from werkzeug.utils import secure_filename
from fastapi import UploadFile
import hashlib 
import shutil
import json
import os

from services.rag_service.vector_store import vector_store

from databases.infra.crud_documents import create_document

class Chunker:
    
    def __init__(self, upload_dir="uploads",chunk_size=500, chunk_overlap=50):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap)
        self.upload_dir = upload_dir
        os.makedirs(upload_dir, exist_ok=True)

    def upload(self, source_file: UploadFile, db, user_id:str):

        filename = secure_filename(source_file.filename)
        destination = os.path.join(self.upload_dir, filename)

        with open(destination, "wb") as out_file:
            shutil.copyfileobj(source_file.file, out_file)
      
        loader = PyPDFLoader(destination)
        pages = loader.load()

        page_docs = []
        full_text_parts = []
        for page in pages:
            text = page.page_content
            full_text_parts.append(text)
            doc = Document(
                page_content=page.page_content,
                metadata={
                "source": destination,
                "page_number": page.metadata.get("page", 0),
                }
)
            page_docs.append(doc)

        full_text = "\n".join(full_text_parts)
        document_record = create_document(
            db=db,
            user_id=user_id,
            file_name=filename,
            page_count=len(pages),
            original_text=full_text,
            storage_path=destination
        )

        # Split pages into overlapping chunks
        chunk_docs = self.splitter.split_documents(page_docs)

        # Assign a hash per chunk (for versioning + dedupe)
        for d in chunk_docs:
            d.metadata["hash"] = hash_text(d.page_content)
            d.metadata["doc_id"] = str(document_record.id)
            d.metadata["user_id"] = user_id

        vector_store.add_documents(chunk_docs)

        return {
            "file": destination,
            "pages": len(pages),
            "chunks": len(chunk_docs)
            }

def hash_text(text: str) -> str:
    """Generate SHA-256 hash of text."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()