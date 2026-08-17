"""
Deterministic Assistant Tools layer binding BatchManager and BatchService data methods.
"""
from typing import Any, Dict, List, Optional, Union
import logging

from src.assistant.exceptions import InvalidToolArgumentError, ToolExecutionError
from src.batch import (
    BatchManager,
    BatchNotFoundError,
    FarmerSummary,
    HerbSummary,
    InventorySummary,
    TraceabilityPayload,
)
from src.services.batch_service import BatchService

logger = logging.getLogger(__name__)


class AssistantTools:
    """
    Exposes deterministic backend capabilities as strongly-typed tool methods.
    Does NOT calculate inventory independently; delegates strictly to BatchManager/BatchService.
    """

    def __init__(
        self,
        batch_manager: Optional[BatchManager] = None,
        batch_service: Optional[BatchService] = None,
    ):
        self.batch_manager = batch_manager or BatchManager()
        self.batch_service = batch_service or BatchService(batch_manager=self.batch_manager)

    def get_herb_batches(self, herb_name: str) -> Dict[str, Any]:
        """
        Lists all batches associated with a specific herb species.
        """
        if not herb_name or not isinstance(herb_name, str) or not herb_name.strip():
            raise InvalidToolArgumentError("herb_name must be a non-empty string.")

        clean_herb = herb_name.strip()
        batches = self.batch_manager.list_batches(herb_species=clean_herb)
        batch_dicts = [b.model_dump() if hasattr(b, "model_dump") else b.dict() for b in batches]
        return {
            "herb_name": clean_herb,
            "total_count": len(batch_dicts),
            "batches": batch_dicts,
        }

    def get_farmer_batches(self, farmer_id: str) -> Dict[str, Any]:
        """
        Lists all batches created by a specific farmer ID.
        """
        if not farmer_id or not isinstance(farmer_id, str) or not farmer_id.strip():
            raise InvalidToolArgumentError("farmer_id must be a non-empty string.")

        clean_farmer = farmer_id.strip()
        batches = self.batch_manager.list_batches(farmer_id=clean_farmer)
        batch_dicts = [b.model_dump() if hasattr(b, "model_dump") else b.dict() for b in batches]
        return {
            "farmer_id": clean_farmer,
            "total_count": len(batch_dicts),
            "batches": batch_dicts,
        }

    def get_herb_summary(self, herb_name: str) -> Dict[str, Any]:
        """
        Retrieves aggregated metrics summary for a specific herb species.
        """
        if not herb_name or not isinstance(herb_name, str) or not herb_name.strip():
            raise InvalidToolArgumentError("herb_name must be a non-empty string.")

        clean_herb = herb_name.strip()
        summary = self.batch_manager.get_herb_summary(clean_herb)
        return summary.model_dump() if hasattr(summary, "model_dump") else summary.dict()

    def get_farmer_summary(self, farmer_id: str) -> Dict[str, Any]:
        """
        Retrieves aggregated metrics summary for a specific farmer ID.
        """
        if not farmer_id or not isinstance(farmer_id, str) or not farmer_id.strip():
            raise InvalidToolArgumentError("farmer_id must be a non-empty string.")

        clean_farmer = farmer_id.strip()
        summary = self.batch_manager.get_farmer_summary(clean_farmer)
        return summary.model_dump() if hasattr(summary, "model_dump") else summary.dict()

    def get_inventory_summary(self) -> Dict[str, Any]:
        """
        Retrieves overall system inventory analytics across all herbs and farmers.
        """
        summary = self.batch_manager.get_inventory_summary()
        return summary.model_dump() if hasattr(summary, "model_dump") else summary.dict()

    def get_batch(self, batch_id: str) -> Dict[str, Any]:
        """
        Retrieves full details of a specific batch by unique Batch ID.
        """
        if not batch_id or not isinstance(batch_id, str) or not batch_id.strip():
            raise InvalidToolArgumentError("batch_id must be a non-empty string.")

        clean_batch_id = batch_id.strip()
        try:
            batch = self.batch_manager.get_batch(clean_batch_id)
            return batch.model_dump() if hasattr(batch, "model_dump") else batch.dict()
        except BatchNotFoundError:
            return {
                "found": False,
                "batch_id": clean_batch_id,
                "error": f"Batch '{clean_batch_id}' not found.",
            }

    def get_batch_traceability(self, batch_id: str) -> Dict[str, Any]:
        """
        Retrieves blockchain-ready traceability payload and tamper-evident SHA-256 hash for a batch.
        """
        if not batch_id or not isinstance(batch_id, str) or not batch_id.strip():
            raise InvalidToolArgumentError("batch_id must be a non-empty string.")

        clean_batch_id = batch_id.strip()
        try:
            payload = self.batch_manager.build_traceability_payload(clean_batch_id)
            return payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
        except BatchNotFoundError:
            return {
                "found": False,
                "batch_id": clean_batch_id,
                "error": f"Batch '{clean_batch_id}' not found.",
            }

    def execute_tool(self, tool_name: str, kwargs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Central dispatch for executing tool functions safely by name.
        """
        allowlist = {
            "get_herb_batches": self.get_herb_batches,
            "get_farmer_batches": self.get_farmer_batches,
            "get_herb_summary": self.get_herb_summary,
            "get_farmer_summary": self.get_farmer_summary,
            "get_inventory_summary": self.get_inventory_summary,
            "get_batch": self.get_batch,
            "get_batch_traceability": self.get_batch_traceability,
        }

        if tool_name not in allowlist:
            raise ToolExecutionError(f"Unauthorized or unknown tool: '{tool_name}'")

        try:
            return allowlist[tool_name](**kwargs)
        except InvalidToolArgumentError:
            raise
        except TypeError as e:
            raise InvalidToolArgumentError(f"Invalid arguments for tool '{tool_name}': {e}")
        except Exception as e:
            logger.exception(f"Error executing tool '{tool_name}': {e}")
            raise ToolExecutionError(f"Tool '{tool_name}' execution failed: {e}")


def get_tool_definitions() -> List[Dict[str, Any]]:
    """
    Returns OpenAI / LLM-compatible tool declarations.
    """
    return [
        {
            "type": "function",
            "function": {
                "name": "get_herb_batches",
                "description": "Get all batches of a specific Ayurvedic herb species (e.g. Ashwagandha, Tulsi, Shatavari, Neem, Giloy, Amla).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "herb_name": {
                            "type": "string",
                            "description": "Name of the herb species (common or canonical botanical name).",
                        }
                    },
                    "required": ["herb_name"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "get_farmer_batches",
                "description": "Get all herb batches supplied by a specific farmer ID (e.g. F001, F002).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {
                            "type": "string",
                            "description": "Farmer unique identifier (e.g., F001).",
                        }
                    },
                    "required": ["farmer_id"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "get_herb_summary",
                "description": "Get aggregated summary analytics for a specific herb (total quantity kg, batch count, farmer count, confidence stats).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "herb_name": {
                            "type": "string",
                            "description": "Name of the herb species.",
                        }
                    },
                    "required": ["herb_name"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "get_farmer_summary",
                "description": "Get aggregated inventory summary for a specific farmer ID (total stock kg, batch count, herb species list).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "farmer_id": {
                            "type": "string",
                            "description": "Farmer unique identifier (e.g., F001).",
                        }
                    },
                    "required": ["farmer_id"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "get_inventory_summary",
                "description": "Get total platform inventory summary across all herbs, batches, and farmers.",
                "parameters": {
                    "type": "object",
                    "properties": {},
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "get_batch",
                "description": "Get detailed record of a specific batch using its Batch ID (e.g. DRAVYA-ASH-20260810-346DA7).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "batch_id": {
                            "type": "string",
                            "description": "Deterministic Batch ID.",
                        }
                    },
                    "required": ["batch_id"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "get_batch_traceability",
                "description": "Get blockchain traceability information and tamper-evident SHA-256 hash for a specific batch ID.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "batch_id": {
                            "type": "string",
                            "description": "Deterministic Batch ID.",
                        }
                    },
                    "required": ["batch_id"],
                },
            },
        },
    ]
