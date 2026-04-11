from agents.agent_interface import AgentInterface
from typing import override
from datetime import datetime
import json

class DatabaseAgent(AgentInterface):
    def __init__(self, tool_executor):
        super().__init__(tool_executor)

    @override
    async def run(self, message_history, user_message=None, depth:int=0, max_depth:int=10):

        if depth > max_depth:
            return json.dumps({"Error": "Max iterations reached"})

        SYSTEM_PROMPT = """
            You are a financial database agent for a personal and business finance intelligence system.
            You help users query, analyze, and understand their financial data.

            You MUST follow this exact sequence:

            STEP 1: Call get_all_dbs ONCE to discover all connected financial databases.
            STEP 2: Find the database matching the requested db_name from the results.
            STEP 3: Use the exact source_name from the results as db_name in ALL subsequent tool calls.
            STEP 4: Call list_tables, get_schema, get_sample_rows, get_column_stats to gather the data needed to complete the task.

            You are working with financial data. Tables may include:
            - Personal: transactions, accounts, budgets, categories, recurring payments
            - Business: general_ledger, invoices, vendors, expense_reports, audit_log

            NEVER guess or assume database names — always use the source_name from get_all_dbs.
            NEVER call get_all_dbs more than once per session.
            NEVER repeat a tool call you have already made with the same arguments.
            Once you have sufficient data to complete the task, stop and return your answer as JSON.
        """

        if message_history is None:
            message_history = []

        if user_message:
            message_history.append({
                "role": "user",
                "content": user_message
            })

        response = self.ollama_client.chat(
            model="qwen2.5:7b",
            messages=[{
                "role": "system",
                "content": SYSTEM_PROMPT
            }, *message_history],
            tools=self.tool_executor.groq_tool_schema()
        )

        decision = response.message

        if decision.tool_calls:
            for tool in decision.tool_calls:
                tool_name = tool.function.name
                tool_args = tool.function.arguments

                tool_result = await self.tool_executor.execute_tool(tool_name, tool_args)

                message_history.append({
                    "role": "assistant",
                    "tool_calls": decision.tool_calls
                })

                message_history.append({
                    "role": "tool",
                    "name": tool_name,
                    "content": str(tool_result)
                })

            return await self.run(message_history=message_history, depth=depth+1)

        else:
            message_history.append({
                "role": "assistant",
                "content": decision.content
            })
            return decision.content


async def get_db_agent():
    from mcp_connection.mcp_client import MCPClient
    from tools.tool_executor import ToolExecutor

    mcp_client = MCPClient()
    await mcp_client.connect_to_server("mcp_connection/servers/db_server.py")

    tool_executor = ToolExecutor(mcp_client=mcp_client)
    await tool_executor.list_tools()

    return DatabaseAgent(tool_executor=tool_executor)