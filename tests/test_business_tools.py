from mcp_connection.servers.business_finance_server import (
    run_sql,
    read_policy_document,
    generate_chart
)

def run_tests():
    db_name = "business_finance_data"   # change if needed

    print("\n==============================")
    print("TEST: run_sql (basic query)")
    print("==============================")

    result = run_sql(
        db_name=db_name,
        query="SELECT * FROM invoices LIMIT 5;"
    )
    print(result)

    if "error" in result:
        print("run_sql failed")
        return

    print("\n==============================")
    print("TEST: run_sql (aggregation)")
    print("==============================")

    agg_result = run_sql(
        db_name=db_name,
        query="""
        SELECT vendor_id, SUM(amount) as total_spend
        FROM invoices
        GROUP BY vendor_id
        LIMIT 5;
        """
    )
    print(agg_result)

    print("\n==============================")
    print("TEST: generate_chart")
    print("==============================")

    if agg_result.get("rows"):
        chart = generate_chart(
            data=agg_result["rows"],
            x_key="vendor_id",
            y_key="total_spend",
            chart_type="bar"
        )
        print(chart)
    else:
        print("No data available for chart")

    print("\n==============================")
    print("TEST: read_policy_document (SMALL DOC)")
    print("==============================")

    SMALL_DOC_ID = "PUT_SMALL_DOC_ID_HERE"

    small_doc = read_policy_document(
        document_id=SMALL_DOC_ID,
        user_id="user_987"
    )
    print(small_doc)

    print("\n==============================")
    print("TEST: read_policy_document (LARGE DOC - RAG)")
    print("==============================")

    LARGE_DOC_ID = "PUT_LARGE_DOC_ID_HERE"

    large_doc = read_policy_document(
        document_id=LARGE_DOC_ID,
        query="expense policy violations reimbursement rules",
        user_id="user_987"
    )
    print(large_doc)


if __name__ == "__main__":
    run_tests()