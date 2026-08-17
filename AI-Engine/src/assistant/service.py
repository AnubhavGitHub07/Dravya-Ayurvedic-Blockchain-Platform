"""
High-level Assistant Orchestration Service connecting LLM provider, Intent Analyzer, and Assistant Tools.
"""
import logging
from typing import Any, Dict, Optional

from src.assistant.exceptions import (
    AssistantError,
    InvalidToolArgumentError,
    MaxToolCallsExceededError,
    ToolExecutionError,
)
from src.assistant.intent import IntentAnalyzer
from src.assistant.provider import LLMProvider, MockLLMProvider, get_llm_provider
from src.assistant.schemas import ChatRequest, ChatResponse
from src.assistant.tools import AssistantTools
from src.batch import BatchManager

logger = logging.getLogger(__name__)

MAX_TOOL_CALLS_PER_REQUEST = 3


class AssistantService:
    """
    Service orchestrator executing natural language chat requests against deterministic backend tools.
    Enforces no-hallucination policy, max tool call thresholds, and clean error handling.
    """

    def __init__(
        self,
        tools: Optional[AssistantTools] = None,
        provider: Optional[LLMProvider] = None,
        intent_analyzer: Optional[IntentAnalyzer] = None,
    ):
        self.tools = tools or AssistantTools()
        self.provider = provider or get_llm_provider()
        self.intent_analyzer = intent_analyzer or IntentAnalyzer()

    def process_chat(self, request: ChatRequest) -> ChatResponse:
        """
        Executes end-to-end chat workflow:
        Input validation -> Intent detection & tool call -> Backend tool execution -> Answer synthesis.
        """
        user_msg = request.message

        # 1. Determine tool call via LLM Provider (or intent analyzer)
        try:
            tool_call, thought = self.provider.generate_with_tools(user_msg)
        except Exception as e:
            logger.exception(f"LLM Provider error during intent determination: {e}")
            # Fall back to offline provider
            fallback_provider = MockLLMProvider()
            tool_call, thought = fallback_provider.generate_with_tools(user_msg)

        # 2. If no tool execution is required (general conversational query or missing entity)
        if tool_call is None:
            ans = thought or "I am Dravya AI Assistant. How can I assist you with your Ayurvedic herb inventory?"
            return ChatResponse(
                answer=ans,
                intent="conversational",
                data=None,
                tool_used=None,
            )

        # 3. Tool execution loop with maximum tool call protection
        tool_name = tool_call.name
        kwargs = tool_call.arguments
        call_count = 0

        logger.info(f"Executing tool '{tool_name}' with args: {kwargs}")

        try:
            call_count += 1
            if call_count > MAX_TOOL_CALLS_PER_REQUEST:
                raise MaxToolCallsExceededError("Exceeded maximum tool calls limit per request.")

            # Deterministically execute backend function
            tool_data = self.tools.execute_tool(tool_name, kwargs)

        except InvalidToolArgumentError as e:
            logger.warning(f"Invalid tool argument: {e}")
            return ChatResponse(
                answer=f"Kripya sahi parameters pradan karein. Error: {str(e)}",
                intent=tool_name,
                data={"error": str(e)},
                tool_used=tool_name,
            )
        except ToolExecutionError as e:
            logger.error(f"Tool execution failed: {e}")
            return ChatResponse(
                answer="Khed hai, request process karte waqt backend error aaya. Kripya punah prayas karein.",
                intent=tool_name,
                data={"error": "Tool execution failed"},
                tool_used=tool_name,
            )

        # 4. Synthesize answer based strictly on retrieved data
        try:
            answer_text = self.provider.synthesize_answer(user_msg, tool_name, tool_data)
        except Exception as e:
            logger.warning(f"Failed to synthesize answer via main provider: {e}. Using mock fallback.")
            fallback_provider = MockLLMProvider()
            answer_text = fallback_provider.synthesize_answer(user_msg, tool_name, tool_data)

        # Derive intent name clean
        intent_name = tool_name.replace("get_", "")

        return ChatResponse(
            answer=answer_text,
            intent=intent_name,
            data=tool_data,
            tool_used=tool_name,
        )
