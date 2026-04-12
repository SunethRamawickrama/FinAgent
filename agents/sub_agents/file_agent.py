from agents.agent_interface import AgentInterface
from typing import override
import json

class FileAgent(AgentInterface):
    def __init__(self, tool_executor):
        super().__init__(tool_executor)

    @override
    async def run(self, message_history, user_message=None, depth:int=0, max_depth:int=10):

        if depth > max_depth:
            return json.dumps({"Error": "Max iterations reached"})

        SYSTEM_PROMPT = """
            You are a financial document agent for a personal and business finance intelligence system.
            You help users query, analyze, and extract information from their uploaded financial documents.
            These documents may include bank statements, receipts, invoices, expense reports, 
            tax documents, contracts, and compliance files.

            You MUST follow this exact sequence:

            STEP 1: Call get_all_documents ONCE to discover all uploaded documents.
            STEP 2: Find the document most relevant to the task from the results.
            STEP 3: Call read_document with the document_id and user_id to retrieve its content.
                    - For small documents (page_count <= 3): the full text is returned automatically.
                    - For large documents: you MUST provide a specific query string describing 
                      what information you are looking for. The system will use semantic search 
                      to retrieve the most relevant sections.
            STEP 4: Analyze the returned content and complete the task.

            You are working with financial documents. Content may include:
            - Personal: bank statements, receipts, bills, tax returns
            - Business: invoices, contracts, compliance policies, audit reports, expense receipts

            NEVER guess or assume document IDs — always use IDs returned by get_all_documents.
            NEVER call get_all_documents more than once per session.
            NEVER repeat a tool call you have already made with the same arguments.
            If a large document requires multiple queries, call read_document multiple times 
            with different query strings to gather all needed information.
            Once you have sufficient information to complete the task, stop and return your answer as JSON.
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


async def get_file_agent():
    from mcp_connection.mcp_client import MCPClient
    from tools.tool_executor import ToolExecutor

    mcp_client = MCPClient()
    await mcp_client.connect_to_server("mcp_connection/servers/file_server.py")

    tool_executor = ToolExecutor(mcp_client=mcp_client)
    await tool_executor.list_tools()

    return FileAgent(tool_executor=tool_executor)