from typing import override
import json

from agents.agent_interface import AgentInterface

class OrchestratorAgent(AgentInterface):    

    def __init__(self, tool_executor):
        super().__init__(tool_executor)

    @override
    async def run(self, message_history, user_message=None, depth:int=0, max_depth:int=10):

        if depth > max_depth:
            return json.dumps({"Error": "Max iterations reached"})

        SYSTEM_PROMPT = """You are FinAgent, an intelligent financial assistant that helps users 
        understand and manage their personal and business finances.

        You have access to these specialized agents as tools:
        - database_agent: queries connected financial databases — transactions, accounts, 
          budgets, invoices, vendors, expense reports, general ledger entries
        - file_agent: reads and analyzes uploaded financial files — bank statements, 
          receipts, CSV exports, Excel reports
        - nessie_agent: connects to Capital One accounts via the Nessie API to fetch 
          live account balances, transactions, purchases, deposits, and bills

        You can help users with tasks like:

        PERSONAL FINANCE
        - Summarize spending by category for a given period
        - Identify recurring payments and subscriptions
        - Compare actual spending against budget limits
        - Flag unusual or large transactions
        - Calculate savings rate and progress toward savings goals
        - Generate a monthly or weekly finance report

        BUSINESS FINANCE
        - Find invoices that are overdue or missing purchase orders
        - Summarize vendor spend by vendor or cost center
        - Identify expense report violations or policy breaches
        - Analyze general ledger entries for a given period or account code
        - Flag unreconciled or unapproved ledger entries
        - Summarize outstanding payables and receivables

        GENERAL RULES
        - Always identify which database or source is most relevant before querying
        - Break complex tasks into steps and delegate each step to the right agent
        - When analyzing transactions, always consider the time period the user is asking about
        - Return clear, structured, human-readable responses with numbers formatted as currency
        - If a task requires both a database and a file, use both agents and synthesize the results
        - Never fabricate financial data — only report what the agents return
        - If you cannot complete a task with available tools, clearly explain why"""

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
            tools=self.tool_executor.groq_tool_schema(),
        )

        decision = response.message

        print(f"orchestrator decision: {decision}\n")

        if decision.tool_calls:
            for tool in decision.tool_calls:
                tool_name = tool.function.name
                tool_args = tool.function.arguments

                print(f"calling tool: {tool_name}")

                tool_result = await self.tool_executor.execute_tool(tool_name, tool_args)

                print(f"tool result: {tool_result}\n")

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