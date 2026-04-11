from mcp_connection.servers.db_server import (
    get_all_dbs,
    get_schema,
    sample_rows,
    list_tables,
    get_column_stats,
    get_table_metadata
)

def run_tests():
    print("\n--- TEST: get_all_dbs ---")
    res = get_all_dbs()
    print(res)

    if "databases" in res and len(res["databases"]) > 0:
        db_name = res["databases"][0]['source_name']
        print(f"\nUsing DB: {db_name}")

        print("\n--- TEST: list_tables ---")
        tables = list_tables(db_name)
        print(tables)

        if tables["tables"]:
            table_name = tables["tables"][0]["table_name"]
            print(f"\nUsing Table: {table_name}")

            print("\n--- TEST: get_schema ---")
            print(get_schema(db_name, table_name))

            print("\n--- TEST: sample_rows ---")
            print(sample_rows(db_name, table_name, 5))

            print("\n--- TEST: get_column_stats ---")
            # pick first column dynamically
            schema = get_schema(db_name, table_name)
            if schema["columns"]:
                column_name = schema["columns"][0]["column_name"]
                print(get_column_stats(db_name, table_name, column_name))

            print("\n--- TEST: get_table_metadata ---")
            print(get_table_metadata(db_name, table_name))

if __name__ == "__main__":
    run_tests()