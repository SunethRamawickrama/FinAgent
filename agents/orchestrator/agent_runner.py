from agents.orchestrator.orchestrator_agent import OrchestratorAgent
from tools.tool_executor import ToolExecutor
from mcp_connection.mcp_client import MCPClient
import traceback

class AgentRunner:
    """
    Initialized once at app startup.
    Reused across all incoming queries.
    """

    def __init__(self):
        self.agent         = None
        self.mcp_client    = None
        self.message_history = []

    async def initialize(self):
        self.mcp_client = MCPClient()
        await self.mcp_client.connect_to_server("mcp_connection/servers/main_mcp_server.py")

        tool_executor = ToolExecutor(mcp_client=self.mcp_client)
        await tool_executor.list_tools()

        self.agent = OrchestratorAgent(tool_executor=tool_executor)

    async def query(self, task: str, keep_history: bool = True) -> str:
        """
        Run a query through the orchestrator.
        keep_history=True  — agent remembers previous messages (conversational)
        keep_history=False — fresh context every query (stateless)
        """
        try:
            if not keep_history:
                self.message_history = []

            result = await self.agent.run(
                message_history=self.message_history,
                user_message=task
            )
            return result

        except Exception:
            traceback.print_exc()
            return "An error occurred while processing your request."

    async def reset(self):
        """Clear conversation history."""
        self.message_history = []

    async def cleanup(self):
        if self.mcp_client:
            await self.mcp_client.cleanup()


# singleton
agent_runner = AgentRunner()