from mcp_connection.servers.file_server import get_all_documents, read_document

def run_tests():
    print("\n--- TEST: get_all_documents ---")
    res = get_all_documents()
    print(res)

    if res.get("count", 0) == 0:
        print("\nNo documents found — upload a file first")
        return

    doc = res["documents"][0]
    doc_id = doc["id"]

    print("\n--- TEST: read_document (small file or no query) ---")
    res2 = read_document(document_id=doc_id)
    print(res2)

    print("\n--- TEST: read_document (RAG mode test) ---")
    res3 = read_document(
        document_id=doc_id,
        query="money spending on dining"
    )
    print(res3)


if __name__ == "__main__":
    run_tests()