from mcp.server.fastmcp import FastMCP
from sqlalchemy.orm import Session
from databases.infra.connection import SessionLocal
from databases.infra import crud
from services.db_service import ops
from services.db_service.db_factory import execute_query

db_mcp_server = FastMCP()

@db_mcp_server.tool(
    name="get_all_dbs",
    description="List all active databases in the system from registry"
)
def get_all_dbs():
    try:
        db: Session = SessionLocal()

        sources = crud.get_active_data_sources(db)

        return {
            "count": len(sources),
            "databases": [
                {
                    "id": str(s.id),
                    "name": s.name,
                    "source_name": s.source_name,
                    "source_type": s.source_type,
                    "host": s.host,
                    "port": s.port,
                    "status": s.status
                }
                for s in sources
            ]
        }

    except Exception as e:
        return {"error": str(e)}

    finally:
        db.close()

@db_mcp_server.tool(
        name = "get_schema",
        description="""Returns column names and types for a given table."""
)
def get_schema(db_name: str, table_name: str) -> dict:
    
    result = execute_query(
        db_name,
        """
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = %s
        ORDER BY ordinal_position
        """,
        params=(table_name,)
    )
    return {"columns": result.rows}

@db_mcp_server.tool(
        name="get_sample_rows",
        description=  """Returns n number of sample rows from a table."""
)
def sample_rows(db_name: str, table_name: str, n: int = 10) -> dict:
  
    result = execute_query(
        db_name,
        f"SELECT * FROM {table_name} LIMIT %s",
        params=(n,)
    )
    return {"rows": result.rows, "row_count": result.row_count}

@db_mcp_server.tool(
        name="list_tables",
        description= """Lists all tables in a database."""
)
def list_tables(db_name: str) -> dict:
   
    result = execute_query(
        db_name,
        """
        SELECT table_name, table_type
        FROM information_schema.tables
        WHERE table_schema = 'public'
        """
    )
    return {"tables": result.rows}

@db_mcp_server.tool(
        name="get_column_stats",
        description="""Returns null count, distinct count, sample values for a column."""
)
def get_column_stats(db_name: str, table_name: str, column_name: str) -> dict:
    
    result = execute_query(
        db_name,
        f"""
        SELECT
            COUNT(*) as total_rows,
            COUNT({column_name}) as non_null_rows,
            COUNT(DISTINCT {column_name}) as distinct_values
        FROM {table_name}
        """,
    )
    samples = execute_query(
        db_name,
        f"SELECT DISTINCT {column_name} FROM {table_name} LIMIT 5"
    )
    return {
        "stats": result.rows[0],
        "sample_values": [r[column_name] for r in samples.rows]
    }

@db_mcp_server.tool(
    name="get_table_metadata",
    description="Returns governance metadata for a table: owner, retention policy, access controls."
)
def get_table_metadata(db_name: str, table_name: str) -> dict:
    # return metadata for a given table
    result = execute_query(
        db_name,
        """
        SELECT *
        FROM information_schema.tables
        WHERE table_name = %s AND table_schema = 'public'
        """,
        params=(table_name,)
    )
    return {
        "owner": None,
        "retention_policy_days": None,
        "encryption_at_rest": None,
        "access_control_list": [],
        "consent_basis": None,
        "table_info": result.rows[0] if result.rows else {}
    }


def main():
    # Initialize and run the server
    db_mcp_server.run(transport="stdio")

if __name__ == "__main__":
    main()