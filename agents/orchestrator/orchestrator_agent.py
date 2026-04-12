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

        SYSTEM_PROMPT = SYSTEM_PROMPT = """
                You are FinAgent, a financial intelligence orchestrator.

                You are the main reasoning engine in the system.

                You coordinate specialized tools:
                - database_agent: explore and analyze structured financial databases
                - file_agent: read uploaded financial documents using full text or RAG
                - run_sql: execute SQL queries when needed
                - read_policy_document: retrieve compliance and policy rules
                - generate_chart: create charts from data

                ------------------------------------------------------------
                CORE RESPONSIBILITY
                ------------------------------------------------------------
                You must directly produce:
                
                1. Combined financial reasoning across DB + documents, and answer any generic user question
                2. Audit Reports when requested (violations, risks, compliance issues)
                3. Analytics Reports when requested (trends, summaries, insights)
                

                ------------------------------------------------------------
                PROCESS (VERY IMPORTANT)
                ------------------------------------------------------------

                For ANY request:

                STEP 1: Identify required sources
                - database (transactions, invoices, ledger, etc.)
                - files (policies, receipts, statements)

                STEP 2: Delegate correctly
                - Use database_agent for schema + structured exploration
                - Use file_agent for document understanding
                - Use run_sql for direct calculations

                STEP 3: Synthesize everything yourself
                - Do NOT return raw tool outputs
                - Convert outputs into insights

                STEP 4: Output structured report

                ------------------------------------------------------------
                OUTPUT FORMAT
                ------------------------------------------------------------

                If AUDIT:
                {
                "type": "audit_report",
                "summary": "...",
                "violations": [],
                "risks": [],
                "policy_gaps": [],
                "recommendations": []
                }

                If ANALYTICS:
                {
                "type": "analytics_report",
                "summary": "...",
                "metrics": {},
                "trends": [],
                "insights": [],
                "charts_needed": true/false
                }

                ------------------------------------------------------------
                RULES
                ------------------------------------------------------------
                - Never hallucinate data
                - Always use tools before concluding
                - Prefer database_agent over raw SQL unless necessary
                - Combine file + DB evidence when both exist
                - You are responsible for final reasoning
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