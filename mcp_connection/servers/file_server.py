from mcp.server.fastmcp import FastMCP
from sqlalchemy.orm import Session
from databases.infra.crud_documents import get_documents_by_user
from databases.infra.connection import get_db
file_mcp_server = FastMCP()

@file_mcp_server.tool(
    name="get_all_documents",
    description="Get all uploaded documents for a user"
)
def get_all_documents() -> dict: 
    
    db = next(get_db())                        
    try:
        docs = get_documents_by_user(db, user_id="user_987")
        return {
            "count": len(docs),
            "documents": [
                {
                    "id": str(doc.id),
                    "file_name": doc.file_name,
                    "page_count": doc.page_count,
                    "created_at": str(doc.created_at),
                }
                for doc in docs
            ]
        }
    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()

from databases.infra.crud_documents import get_document_by_id
from services.rag_service.vector_store import vector_store

@file_mcp_server.tool(
    name="read_document",
    description="Read a document. If small, return full text. If large, use semantic search."
)
def read_document(document_id: str, query: str = None):
    try:
        user_id: str="user_987"
        db = next(get_db())
        doc = get_document_by_id(db, document_id)

        if not doc:
            return {"error": "Document not found"}

        if doc.user_id != user_id:
            return {"error": "Unauthorized access"}

        # if the file length is less than 3 pages, feed the entire context to the agent window
        if doc.page_count <= 3:
            return {
                "mode": "full_text",
                "file_name": doc.file_name,
                "content": doc.original_text
            }

        # if the file is too large, use RAG 
        if not query:
            return {
                "error": "Query required for large documents",
                "hint": "Provide a query to search within the document"
            }

        results = vector_store.search(query=query, k=5)

        return {
            "mode": "rag",
            "file_name": doc.file_name,
            "chunks": [
                {
                    "content": r.page_content,
                    "metadata": r.metadata
                }
                for r in results
                if r.metadata.get("doc_id") == str(document_id)
            ]
        }

    except Exception as e:
        return {"error": str(e)}

def main():
    # Initialize and run the server
    file_mcp_server.run(transport="stdio")

if __name__ == "__main__":
    main()