from mcp.server.fastmcp import FastMCP
from agents.sub_agents.db_agent import DatabaseAgent
from agents.sub_agents.file_agent import FileAgent
from mcp_connection.mcp_client import MCPClient
from tools.tool_executor import ToolExecutor
from services.db_service.db_factory import execute_query
from services.db_service.ops import serialize_row
import traceback
import json
import sys

from mcp_connection.servers.db_server import get_all_dbs

'''This is the main mcp server that the orchestrator agent use.
All the subagents are added as tools for the main agent'''
main_mcp_server = FastMCP()

@main_mcp_server.tool(
        name="get_all_sources",
        description='''Exposes all the sources connected to the system. If a query has an ambigious source name, use this tool
        to get the names of all the databases, files, or buckets connected to the system. Almost always use this tool first to get
        the exact details of a source'''
)
def get_all_sources():
    return get_all_dbs()

@main_mcp_server.tool(
        name = 'database_management_agent',
        description='''Delegates a database inspection task to the DB scanning agent.
                Use this when you need to inspect database tables, get schemas, sample rows,
                check column statistics, or retrieve table metadata. Pass a clear natural
                language description of what information you need.'''
)
async def execute_database_agent(db_name:str, task:str):
    try:
        mcp_client = MCPClient()
        await mcp_client.connect_to_server("mcp_connection/servers/db_server.py")
   
        toolExecutor = ToolExecutor(mcp_client=mcp_client)
        await toolExecutor.list_tools()

        agent = DatabaseAgent(tool_executor=toolExecutor)
        message_history = []

        task = f"""
        Follow the required sequence:
        1. Call get_all_sources to discover available databases
        2. Find the database with name matching: {db_name}
        3. Use its exact source_name for all subsequent calls
        4. Then complete this task: {task}

        Return results as JSON.
        """ 
        agent_result = await agent.run(message_history=message_history, user_message=task) 
        return agent_result
            
    except Exception as e:
        # traceback.print_exc(file=sys.stderr)
        return {"Error": e}

    finally:
        await mcp_client.cleanup()

# @main_mcp_server.tool(
#     name="file_agent",
#     description="""Delegates a document reading or analysis task to the file agent.
#     Use this when you need to read, search, or extract information from uploaded financial 
#     documents such as bank statements, receipts, invoices, tax documents, contracts, 
#     or compliance files.
#     Provide the user_id so the agent can access only that user's documents.
#     Provide a clear task description of what information you need from the documents."""
# )
# async def execute_file_agent(task: str):
#     mcp_client = None
#     try:
#         mcp_client = MCPClient()
#         await mcp_client.connect_to_server("mcp_connection/servers/file_server.py")

#         tool_executor = ToolExecutor(mcp_client=mcp_client)
#         await tool_executor.list_tools()

#         agent = FileAgent(tool_executor=tool_executor)

#         full_task = f"""

#         Follow the required sequence:
#         1. Call get_all_documents to discover available documents
#         2. Find the document most relevant to the task
#         3. Call read_document with the document_id to retrieve its content
#            - For large documents, provide a specific query string describing what you need
#         4. Then complete this task: {task}

#         Return results as JSON.
#         """

#         return await agent.run(message_history=[], user_message=full_task)

#     except Exception as e:
#         return {"error": str(e)}

#     finally:
#         if mcp_client:
#             await mcp_client.cleanup()

@main_mcp_server.tool(
    name="file_agent",
    description="""Reads and analyzes uploaded financial documents such as bank statements,
    receipts, invoices, tax documents, and compliance files. Use this when the user asks
    about document content. Provide a clear task description of what you need."""
)
def execute_file_agent(task: str) -> dict:
    return {
        "count": 1,
        "documents": [
            {
                "file_name": "bank_statement_jan_-_march_2025.pdf",
                "mode": "full_text",
                "content": """Bank Statement
                Account Holder: John Doe
                Bank: Capital Finance Bank
                Account Number: ****1234
                Statement Period: January 2025 - March 2025

                Summary
                Starting Balance: $4,200.00
                Total Deposits: $3,000.00
                Total Withdrawals: $3,850.75
                Ending Balance: $3,349.25

                Transactions
                Date        Description                             Category    Amount      Balance
                04/01/2025  Direct Deposit - Salary                Income      +3000.00    7200.00
                04/02/2025  UMD Dining Hall - South Campus          Dining      -18.50      7181.50
                04/03/2025  UMD Dining Hall - North Campus          Dining      -22.75      7158.75
                04/04/2025  Grocery Store                           Groceries   -85.20      7073.55
                04/05/2025  UMD Dining Hall - Yahentamitsi          Dining      -19.80      7053.75
                04/06/2025  Coffee Shop                             Dining      -6.50       7047.25
                04/08/2025  UMD Dining Hall - South Campus          Dining      -21.40      7025.85
                04/10/2025  UMD Dining Hall - North Campus          Dining      -23.10      7002.75
                04/12/2025  UMD Dining Hall - Yahentamitsi          Dining      -20.95      6981.80
                04/14/2025  Restaurant - College Park Grill         Dining      -45.60      6936.20
                04/16/2025  UMD Dining Hall - South Campus          Dining      -19.25      6916.95
                04/18/2025  UMD Dining Hall - North Campus          Dining      -22.30      6894.65
                04/20/2025  UMD Dining Hall - Yahentamitsi          Dining      -21.75      6872.90
                04/22/2025  Restaurant - Chipotle                   Dining      -18.90      6854.00
                04/24/2025  UMD Dining Hall - South Campus          Dining      -20.10      6833.90
                04/26/2025  UMD Dining Hall - North Campus          Dining      -24.00      6809.90
                04/28/2025  Restaurant - Panda Express              Dining      -17.85      6792.05
                04/30/2025  UMD Dining Hall - Yahentamitsi          Dining      -21.30      6770.75"""
            }
        ]
    }

def main():
    # Initialize and run the server
    main_mcp_server.run(transport="stdio")

if __name__ == "__main__":
    main()



# NFO:     127.0.0.1:50937 - "POST /api/query HTTP/1.1" 200 OK
# orchestrator decision: role='assistant' content="To provide you with a detailed spending report and compare it against your spending limits, I'll need to follow these steps:\n\n1. **Read the content of the January to March 2025 bank statement** using the `file_agent`.\n2. **Query the finance_plans table in your personal_finance_data database** for your spending limit details.\n\nLet's start by reading the bank statement content.\n" thinking=None images=None tool_name=None tool_calls=[ToolCall(function=Function(name='file_agent', arguments={'task': 'Read and extract transactions from the January to March 2025 bank statement'}))]

# calling tool: file_agent
# tool result: [TextContent(type='text', text='{\n  "count": 1,\n  "documents": [\n    {\n      "file_name": "bank_statement_jan_-_march_2025.pdf",\n      "mode": "full_text",\n      "content": "Bank Statement\\n                Account Holder: John Doe\\n                Bank: Capital Finance Bank\\n                Account Number: ****1234\\n                Statement Period: January 2025 - March 2025\\n\\n                Summary\\n                Starting Balance: $4,200.00\\n                Total Deposits: $3,000.00\\n                Total Withdrawals: $3,850.75\\n               
#  Ending Balance: $3,349.25\\n\\n                Transactions\\n                Date        Description                             Category    Amount      Balance\\n                04/01/2025  Direct Deposit - Salary                Income      +3000.00    7200.00\\n                04/02/2025  UMD Dining Hall - South Campus          Dining      -18.50      7181.50\\n                04/03/2025  UMD Dining Hall - North Campus          Dining      -22.75      7158.75\\n                04/04/2025  Grocery Store                           Groceries   -85.20      7073.55\\n            
#     04/05/2025  UMD Dining Hall - Yahentamitsi          Dining      -19.80      7053.75\\n                04/06/2025  Coffee Shop                 
#             Dining      -6.50       7047.25\\n                04/08/2025  UMD Dining Hall - South Campus          Dining      -21.40      7025.85\\n                04/10/2025  UMD Dining Hall - North Campus          Dining      -23.10      7002.75\\n                04/12/2025  UMD Dining Hall - Yahentamitsi          Dining      -20.95      6981.80\\n                04/14/2025  Restaurant - College Park Grill         Dining      -45.60      6936.20\\n                04/16/2025  UMD Dining Hall - South Campus          Dining      -19.25      6916.95\\n                04/18/2025  UMD Dining Hall - North Campus          Dining      -22.30      6894.65\\n                04/20/2025  UMD Dining Hall - Yahentamitsi          Dining      -21.75      6872.90\\n                04/22/2025  Restaurant - Chipotle                   Dining      -18.90      6854.00\\n              
#   04/24/2025  UMD Dining Hall - South Campus          Dining      -20.10      6833.90\\n                04/26/2025  UMD Dining Hall - North Campus          Dining      -24.00      6809.90\\n                04/28/2025  Restaurant - Panda Express              Dining      -17.85      6792.05\\n                04/30/2025  UMD Dining Hall - Yahentamitsi          Dining      -21.30      6770.75"\n    }\n  ]\n}', annotations=None, meta=None)]

# orchestrator decision: role='assistant' content="Based on the January to March 2025 bank statement for John Doe, here is a spending report:\n\n### Summary:\n- **Starting Balance:** $4,200.00\n- **Total Deposits:** $3,000.00\n- **Total Withdrawals:** $3,850.75\n- **Ending Balance:** $3,349.25\n\n### Transactions:\n1. **Date: 04/01/2025**\n   - **Description:** Direct Deposit - Salary\n   - **Category:** Income\n   - **Amount:** +$3,000.00\n   - **Balance:** $7,200.00\n\n2. **Spending on Dining:**\n   - Multiple dining expenses at UMD Dining Hall and other restaurants.\n   - Total Dining Expenses: $851.75 (from 04/02/2025 to 04/30/2025)\n\n3. **Groceries:**\n   - Date: 04/04/2025\n     - Description: Grocery Store\n     - Category: Groceries\n     - Amount: -$85.20\n     - Balance: $7,114.80\n\n### Spending Analysis:\nThe majority of the spending was on dining with l Dining Expenses: $851.75 (from 04/02/2025 to 04/30/2025)\n\n3. **Groceries:**\n   - Date: 04/04/2025\n     - Description: Grocery Store\n     - Category: Groceries\n     - Amount: -$85.20\n     - Balance: $7,114.80\n\n### Spending Analysis:\nThe majority of the spending was on dining with l Dining Expenses: $851.75 (from 04/02/2025 to 04/30/2025)\n\n3. **Groceries:**\n   - Date: 04/04/2025\n     - Description: Grocery Store\n     - l Dining Expenses: $851.75 (from 04/02/2025 to 04/30/2025)\n\n3. **Groceries:**\n   - Date: 04/04/2025\n     - Description: Grocery Store\n     - Category: Groceries\n     - Amount: -$85.20\n     - Balance: $7,114.80\n\n### Spending Analysis:\nThe majority of the spending was on dining with l Dining Expenses: $851.75 (from 04/02/2025 to 04/30/2025)\n\n3. **Groceries:**\n   - Date: 04/04/2025\n     - Description: Grocery Store\n     - Category: Groceries\n     - Amount: -$85.20\n     - Balance: $7,114.80\n\n### Spending Analysis:\nThe majority of the spending was on dining with a total of $851.75 over the period.\n\nTo check if your spending is within the spending limit for that time period, I will now query the `finance_l Dining Expenses: $851.75 (from 04/02/2025 to 04/30/2025)\n\n3. **Groceries:**\n   - Date: 04/04/2025\n     - Description: Grocery Store\n     - Category: Groceries\n     - Amount: -$85.20\n     - Balance: $7,114.80\n\n### Spending Analysis:\nThe majority of the spending was on dining with l Dining Expenses: $851.75 (from 04/02/2025 to 04/30/2025)\n\n3. **Groceries:**\n   - Date: 04/04/2025\n     - Description: Grocery Store\n     - Category: Groceries\n     - Amount: -$85.20\n     - Balance: $7,114.80\n\n### Spending Analysis:\nThe majority of the spending was on dining with a total of $851.75 over the period.\n\nTo check if your spending is within the spending limit for that time period, I will now query the `finance_plans` table in your `personal_finance_data` database to get the spending limit details.\n\nLet's proceed with the query.\n" thinking=None images=None tool_name=None tool_calls=[ToolCall(function=Function(name='database_management_agent', arguments={'db_name': 'personal_finance_data', 'task': 'Retrieve spending limits for January to March 2025'}))]

# calling tool: database_management_agent
# tool result: [TextContent(type='text', text="The spending limits for the finance plans from January to March 2025 are as follows:\n\n- Q1 2025 Budget: $4,500.00\n- Spring Budget (for April to June): $4,200.00\n\nThese values are derived from the `finance_plans` table in the database `personal_finance_data`. The start date for the January to March 2025 budget plan is February 1, 2025, and it ends on March 31, 2025.\n\nHere's a summary of relevant details:\n\n- **Plan Name**: Q1 2025 Budget\n- **Start Date**: January 1, 2025 (though the actual start date in the database is February 1, 2025)\n- **End Date**: March 31, 2025\n- **Monthly Income**: $6,500.00\n- **Spending Limit for January to March 2025**: $4,500.00\n\nThe Spring Budget plan, which includes the months of April to June, has a spending limit that would not be applicable directly to January to March but is provided as additional context.\n\nBased on this information, the spending limits for the specified period are **$4,500.00** (for Q1 2025 Budget).", annotations=None, meta=None)]

# orchestrator decision: role='assistant' content="Here's a summary of your January to March 2025 spending report and comparison against your budget limits:\n\n### Spending Report:\n- **Starting Balance:** $4,200.00\n- **Total Deposits:** $3,000.00\n- **Total Withdrawals:**\n  - Dining: $1,069.05 (Multiple transactions at various dining locations)\n  - Grocery Store: $85.20\n  - Other expenses: Minimal\n\n### Net Ending Balance:\n$4,200.00 + $3,000.00 - $3,850.75 = **$3,349.25**\n\n### Spending Summary by Category:\n- Dining: $1,069.05\n- Groceries: $85.20\n\n### Spent Amount:\nThe total amount spent during this period is approximately **$1,154.25**.\n\n### Budget Comparison:\n- **Spending Limit for January to March 2025 (Q1 2025 Budget):** $4,500.00\n- Actual Spending: $3,349.25\n\nYour spending is well within the budget limit of $4,500.00 for this period.\n\nWould you like to perform any further analysis or have additional questions?" thinking=None images=None tool_name=None tool_calls=None

# INFO:     127.0.0.1:50545 - "POST /api/query HTTP/1.1" 200 OK