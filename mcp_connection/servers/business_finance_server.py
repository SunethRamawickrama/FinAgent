from mcp.server.fastmcp import FastMCP
from services.db_service.db_factory import execute_query
from services.rag_service.vector_store import vector_store
from databases.infra.connection import SessionLocal
from databases.infra.crud_documents import get_document_by_id
import matplotlib.pyplot as plt
import uuid
import os

business_mcp_server = FastMCP()
os.makedirs("charts", exist_ok=True)


@business_mcp_server.tool(
    name="run_sql",
    description="Execute SQL query on a database"
)
def run_sql(db_name: str, query: str):
    try:
        result = execute_query(db_name, query)
        return {
            "rows": result.rows,
            "row_count": result.row_count
        }
    except Exception as e:
        return {"error": str(e)}


@business_mcp_server.tool(
    name="read_policy_document",
    description="Read policy document. Uses full text if small, otherwise semantic search."
)
def read_policy_document(document_id: str, query: str = None, user_id: str = "user_987"):
    db = SessionLocal()
    try:
        doc = get_document_by_id(db, document_id)

        if not doc:
            return {"error": "Document not found"}

        if doc.user_id != user_id:
            return {"error": "Unauthorized"}

        if doc.page_count <= 3:
            return {
                "mode": "full_text",
                "content": doc.original_text
            }

        if not query:
            return {"error": "Query required for large document"}

        results = vector_store.search(query=query, k=5)

        return {
            "mode": "rag",
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
    finally:
        db.close()


def main():
    business_mcp_server.run(transport="stdio")

if __name__ == "__main__":
    main()