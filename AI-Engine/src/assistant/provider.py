"""
LLM Provider abstraction layer supporting Mock, OpenAI, and Generic HTTP LLM endpoints.
Handles environment configuration and graceful fallback.
"""
from abc import ABC, abstractmethod
import os
import json
import logging
from typing import Any, Dict, List, Optional, Tuple

import httpx

from src.assistant.exceptions import LLMProviderError
from src.assistant.intent import IntentAnalyzer
from src.assistant.schemas import ToolCall
from src.assistant.tools import get_tool_definitions

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are Dravya AI Assistant, an expert AI assistant for the Dravya Ayurvedic Blockchain Platform.
Your primary role is answering user queries regarding Ayurvedic herb inventory, batches, farmer contributions, quality verification status, and blockchain traceability payloads.

STRICT POLICY & GUIDELINES:
1. NEVER INVENT OR HALLUCINATE DATA. Do not invent quantities, batch IDs, farmer IDs, verification statuses, or traceability hashes.
2. Rely strictly on data retrieved via deterministic tool execution.
3. If no matching data or zero batches are returned by a tool, state clearly that no record was found.
4. Keep technical identifiers such as Batch IDs (e.g. DRAVYA-ASH-20260810-346DA7) and Farmer IDs (e.g. F001) intact.
5. Provide helpful, accurate responses matching the user's language (English, Hindi, or Hinglish).
6. Do NOT provide medical diagnosis or unsafe medical advice. You are a platform data and inventory assistant.
"""


class LLMProvider(ABC):
    """Abstract base class for LLM Providers."""

    @abstractmethod
    def generate_with_tools(
        self,
        user_message: str,
        system_prompt: str = SYSTEM_PROMPT,
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> Tuple[Optional[ToolCall], Optional[str]]:
        """
        Processes user query. Returns either a (ToolCall, response_thought) OR (None, final_answer).
        """
        pass

    @abstractmethod
    def synthesize_answer(
        self,
        user_message: str,
        tool_name: str,
        tool_data: Dict[str, Any],
        system_prompt: str = SYSTEM_PROMPT,
    ) -> str:
        """
        Synthesizes structured tool response into natural language (English / Hindi / Hinglish).
        """
        pass


class MockLLMProvider(LLMProvider):
    """
    Deterministic rule-based LLM Provider for offline use, unit testing, and fallback.
    Does not require any API keys or external network requests.
    """

    def __init__(self):
        self.intent_analyzer = IntentAnalyzer()

    def generate_with_tools(
        self,
        user_message: str,
        system_prompt: str = SYSTEM_PROMPT,
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> Tuple[Optional[ToolCall], Optional[str]]:
        intent, tool_name, kwargs = self.intent_analyzer.analyze(user_message)

        if tool_name is not None:
            return ToolCall(name=tool_name, arguments=kwargs or {}), f"Selected tool {tool_name}"
        else:
            # General query or conversational query
            is_hindi = any(w in user_message.lower() for w in ["hai", "kya", "batao", "kaise", "ke", "ki", "ka", "main"])
            if is_hindi:
                return None, "Main Dravya AI Assistant hoon. Aap mujhse Ayurvedic herb inventory, batches, farmer details aur blockchain traceability ke bare me pooch sakte hain."
            return None, "I am Dravya AI Assistant. You can ask me about herb inventory, batch details, farmer contributions, and blockchain traceability."

    def synthesize_answer(
        self,
        user_message: str,
        tool_name: str,
        tool_data: Dict[str, Any],
        system_prompt: str = SYSTEM_PROMPT,
    ) -> str:
        is_hindi = any(w in user_message.lower() for w in [
            "ki", "ka", "ke", "kitni", "kitne", "hai", "paas", "kya", "dikhao", "batao", "se", "main"
        ])

        # 1. get_herb_summary
        if tool_name == "get_herb_summary":
            herb = tool_data.get("canonical_species") or tool_data.get("herb", "Herb")
            qty = tool_data.get("total_quantity", 0.0)
            count = tool_data.get("total_batches", 0)
            farmers = tool_data.get("farmers_count", 0)

            if count == 0:
                return (
                    f"Dravya system me '{herb}' ki koi active inventory record nahi mili."
                    if is_hindi
                    else f"No inventory records found for '{herb}' in the Dravya system."
                )

            if is_hindi:
                return (
                    f"Dravya system me {herb} ki total recorded quantity {qty:.2f} kg hai. "
                    f"Isme total {count} batches aur {farmers} farmers registered hain."
                )
            else:
                return (
                    f"The Dravya platform has a total recorded quantity of {qty:.2f} kg for {herb} "
                    f"across {count} batch(es) from {farmers} farmer(s)."
                )

        # 2. get_farmer_summary
        elif tool_name == "get_farmer_summary":
            farmer_id = tool_data.get("farmer_id", "")
            qty = tool_data.get("total_quantity", 0.0)
            count = tool_data.get("total_batches", 0)
            herbs = tool_data.get("herbs_supplied", [])
            herbs_str = ", ".join(herbs) if herbs else "None"

            if count == 0:
                return (
                    f"Farmer ID {farmer_id} ke paas Dravya system me koi active batches recorded nahi hain."
                    if is_hindi
                    else f"No batch records found for farmer ID {farmer_id} in the Dravya system."
                )

            if is_hindi:
                return (
                    f"Farmer {farmer_id} ke paas total {qty:.2f} kg stock recorded hai, "
                    f"jisme {count} batches hain. Herbs: {herbs_str}."
                )
            else:
                return (
                    f"Farmer {farmer_id} has a total inventory of {qty:.2f} kg across {count} batch(es). "
                    f"Herbs: {herbs_str}."
                )

        # 3. get_herb_batches
        elif tool_name == "get_herb_batches":
            herb = tool_data.get("herb_name", "Herb")
            batches = tool_data.get("batches", [])
            count = len(batches)

            if count == 0:
                return (
                    f"Dravya system me '{herb}' ke koi batches nahi mile."
                    if is_hindi
                    else f"No batches found for herb '{herb}'."
                )

            batch_ids = [b.get("batch_id") for b in batches[:5]]
            ids_str = ", ".join(batch_ids)

            if is_hindi:
                return f"Dravya system me {herb} ke total {count} batches hain: {ids_str}."
            else:
                return f"There are {count} batch(es) recorded for {herb} in Dravya: {ids_str}."

        # 4. get_farmer_batches
        elif tool_name == "get_farmer_batches":
            farmer_id = tool_data.get("farmer_id", "")
            batches = tool_data.get("batches", [])
            count = len(batches)

            if count == 0:
                return (
                    f"Farmer {farmer_id} ke paas koi batches nahi hain."
                    if is_hindi
                    else f"No batches found for farmer {farmer_id}."
                )

            batch_list = [f"{b.get('batch_id')} ({b.get('herb_species')}, {b.get('quantity')} kg)" for b in batches[:5]]
            b_str = "; ".join(batch_list)

            if is_hindi:
                return f"Farmer {farmer_id} ke paas total {count} batches hain: {b_str}."
            else:
                return f"Farmer {farmer_id} has {count} recorded batch(es): {b_str}."

        # 5. get_inventory_summary
        elif tool_name == "get_inventory_summary":
            total_batches = tool_data.get("total_batches", 0)
            total_qty = tool_data.get("total_quantity_kg", 0.0)
            herbs_count = tool_data.get("unique_herbs_count", 0)
            farmers_count = tool_data.get("unique_farmers_count", 0)

            if is_hindi:
                return (
                    f"Dravya platform me total {herbs_count} herb species, {farmers_count} farmers, "
                    f"aur {total_batches} batches hain, jinki kul quantity {total_qty:.2f} kg hai."
                )
            else:
                return (
                    f"The Dravya platform contains a total of {herbs_count} herb species, {farmers_count} farmers, "
                    f"and {total_batches} batches with a combined quantity of {total_qty:.2f} kg."
                )

        # 6. get_batch
        elif tool_name == "get_batch":
            if tool_data.get("found") is False:
                b_id = tool_data.get("batch_id", "")
                return (
                    f"Batch ID '{b_id}' Dravya system me nahi mila."
                    if is_hindi
                    else f"Batch ID '{b_id}' was not found in the Dravya system."
                )

            b_id = tool_data.get("batch_id", "")
            herb = tool_data.get("herb_species", "")
            qty = tool_data.get("quantity", 0.0)
            unit = tool_data.get("quantity_unit", "kg")
            farmer = tool_data.get("farmer_id", "")
            status_val = tool_data.get("verification_status", "UNVERIFIED")
            if hasattr(status_val, "value"):
                status_val = status_val.value

            if is_hindi:
                return (
                    f"Batch {b_id} ki details: Herb: {herb}, Quantity: {qty} {unit}, "
                    f"Farmer: {farmer}, Verification Status: {status_val}."
                )
            else:
                return (
                    f"Batch details for {b_id}: Herb: {herb}, Quantity: {qty} {unit}, "
                    f"Farmer: {farmer}, Verification Status: {status_val}."
                )

        # 7. get_batch_traceability
        elif tool_name == "get_batch_traceability":
            if tool_data.get("found") is False:
                b_id = tool_data.get("batch_id", "")
                return (
                    f"Batch ID '{b_id}' ke liye traceability data uplabdh nahi hai (Batch not found)."
                    if is_hindi
                    else f"Traceability data unavailable for Batch ID '{b_id}' (Batch not found)."
                )

            b_id = tool_data.get("batch_id", "")
            h_hash = tool_data.get("payload_hash", "")
            status_val = tool_data.get("verification_status", "")

            if is_hindi:
                return (
                    f"Batch {b_id} ki blockchain traceability verification successful hai. "
                    f"Status: {status_val}. Tamper-evident SHA-256 Hash: {h_hash}."
                )
            else:
                return (
                    f"Blockchain traceability for batch {b_id} is verified. "
                    f"Status: {status_val}. Tamper-evident SHA-256 Hash: {h_hash}."
                )

        return f"Retrieved data: {tool_data}"


class OpenAILLMProvider(LLMProvider):
    """
    OpenAI / Generic HTTP LLM Provider calling external REST API using httpx.
    """

    def __init__(
        self,
        api_key: str,
        model: str = "gpt-4o-mini",
        base_url: str = "https://api.openai.com/v1",
        timeout: float = 15.0,
    ):
        self.api_key = api_key
        self.model = model
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.fallback = MockLLMProvider()

    def generate_with_tools(
        self,
        user_message: str,
        system_prompt: str = SYSTEM_PROMPT,
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> Tuple[Optional[ToolCall], Optional[str]]:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        messages = [{"role": "system", "content": system_prompt}]
        if conversation_history:
            messages.extend(conversation_history)
        messages.append({"role": "user", "content": user_message})

        payload = {
            "model": self.model,
            "messages": messages,
            "tools": get_tool_definitions(),
            "tool_choice": "auto",
            "temperature": 0.1,
        }

        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
                if resp.status_code != 200:
                    logger.warning(f"LLM Provider API returned status {resp.status_code}. Falling back to offline provider.")
                    return self.fallback.generate_with_tools(user_message, system_prompt, conversation_history)

                data = resp.json()
                choice = data["choices"][0]["message"]

                if "tool_calls" in choice and choice["tool_calls"]:
                    tc = choice["tool_calls"][0]["function"]
                    args = json.loads(tc.get("arguments", "{}"))
                    return ToolCall(name=tc["name"], arguments=args), choice.get("content")

                return None, choice.get("content", "")

        except Exception as e:
            logger.warning(f"Error communicating with LLM Provider: {e}. Falling back to offline provider.")
            return self.fallback.generate_with_tools(user_message, system_prompt, conversation_history)

    def synthesize_answer(
        self,
        user_message: str,
        tool_name: str,
        tool_data: Dict[str, Any],
        system_prompt: str = SYSTEM_PROMPT,
    ) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        prompt = (
            f"User asked: '{user_message}'\n"
            f"Executed tool: '{tool_name}'\n"
            f"Tool returned structured data: {json.dumps(tool_data)}\n\n"
            f"Synthesize a clear, accurate, natural language response in the user's language. Never invent data."
        )
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ]
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.2,
        }

        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    return data["choices"][0]["message"]["content"]
        except Exception as e:
            logger.warning(f"Failed to synthesize with external LLM: {e}. Using fallback synthesizer.")

        return self.fallback.synthesize_answer(user_message, tool_name, tool_data, system_prompt)


def get_llm_provider() -> LLMProvider:
    """
    Factory function loading LLM provider from environment variables.
    Defaults to MockLLMProvider if no valid key is configured. Never crashes application startup.
    """
    provider_name = os.getenv("DRAVYA_LLM_PROVIDER", "mock").lower()
    api_key = os.getenv("DRAVYA_LLM_API_KEY", "") or os.getenv("OPENAI_API_KEY", "")
    model = os.getenv("DRAVYA_LLM_MODEL", "gpt-4o-mini")

    if provider_name in ["openai", "generic_http"] and api_key:
        try:
            return OpenAILLMProvider(api_key=api_key, model=model)
        except Exception as e:
            logger.error(f"Failed to instantiate LLM provider '{provider_name}': {e}. Using MockLLMProvider.")
            return MockLLMProvider()

    # Default offline provider
    return MockLLMProvider()
