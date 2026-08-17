"""
Intent Classification and Entity Extraction Engine for Dravya AI Assistant.
Supports English, Hindi, and Hinglish queries.
"""
import re
from typing import Any, Dict, Optional, Tuple, List

# Known Ayurvedic herb canonical & common names for entity resolution
KNOWN_HERBS = [
    "Ashwagandha", "Tulsi", "Shatavari", "Neem", "Giloy",
    "Amla", "Brahmi", "Mulethi", "Arjuna", "Haritaki",
    "Guduchi", "Gotu Kola", "Bhringraj", "Aloe Vera", "Turmeric"
]


class IntentAnalyzer:
    """
    Deterministic Intent Classification and Entity Extraction engine for Dravya AI Assistant.
    Provides fast, multi-lingual (English/Hindi/Hinglish) pattern matching.
    """

    @staticmethod
    def extract_batch_id(text: str) -> Optional[str]:
        """Extracts deterministic batch ID (e.g. DRAVYA-ASH-20260810-346DA7)."""
        match = re.search(r"\b(DRAVYA-[A-Z0-9]{3,4}-\d{8}-[A-Z0-9]{6,8})\b", text, re.IGNORECASE)
        if match:
            return match.group(1).upper()
        # Generic batch code fallback
        match_gen = re.search(r"\b(DRAVYA-[A-Z0-9\-]+)\b", text, re.IGNORECASE)
        if match_gen:
            return match_gen.group(1).upper()
        return None

    @staticmethod
    def extract_farmer_id(text: str) -> Optional[str]:
        """Extracts farmer ID (e.g., F001, F002)."""
        # Exact F001 pattern
        match = re.search(r"\b(F\d{3,5})\b", text, re.IGNORECASE)
        if match:
            return match.group(1).upper()
        # Keyword based "farmer F001" or "F001 ke paas"
        match_kw = re.search(r"\bfarmer\s*([A-Z0-9]+)\b", text, re.IGNORECASE)
        if match_kw:
            return match_kw.group(1).upper()
        return None

    @staticmethod
    def extract_herb_name(text: str) -> Optional[str]:
        """Extracts herb species name from natural language query."""
        # 1. Check known herbs first
        for herb in KNOWN_HERBS:
            pattern = rf"\b{re.escape(herb)}\b"
            if re.search(pattern, text, re.IGNORECASE):
                return herb

        # 2. Hindi/Hinglish positional pattern "X ki quantity", "X ki total quantity", "X ke batches"
        match_pos = re.search(
            r"\b([A-Za-z]+)\s+(?:ki|ka|ke)\s+(?:total\s+)?(?:quantity|stock|kitni|kitne|batches|details|herb)\b",
            text,
            re.IGNORECASE,
        )
        if match_pos and match_pos.group(1).lower() not in {"system", "is", "ye", "total", "farmer"}:
            return match_pos.group(1).capitalize()

        # 3. English positional pattern "batches of X", "inventory of X", "how much X"
        match_eng = re.search(
            r"(?:batches|inventory|quantity|stock)\s+(?:of|for)\s+([A-Za-z]+)",
            text,
            re.IGNORECASE,
        )
        if match_eng:
            return match_eng.group(1).capitalize()

        match_eng_hm = re.search(
            r"how\s+much\s+([A-Za-z]+)\b",
            text,
            re.IGNORECASE,
        )
        if match_eng_hm and match_eng_hm.group(1).lower() not in {"inventory", "stock", "do", "batches"}:
            return match_eng_hm.group(1).capitalize()

        return None

    def analyze(self, message: str) -> Tuple[str, Optional[str], Dict[str, Any]]:
        """
        Analyzes user message and returns (intent_name, tool_name, tool_kwargs).
        """
        text = message.strip()
        text_lower = text.lower()

        batch_id = self.extract_batch_id(text)
        farmer_id = self.extract_farmer_id(text)

        # 1. Total inventory intent (Check before generic herb extraction)
        if any(w in text_lower for w in [
            "system me total", "total inventory", "overall summary", "all herbs",
            "total stock", "total kitni", "kitni herbs", "total inventory batao",
            "overall inventory", "system me total kitni herbs"
        ]):
            return "inventory_summary", "get_inventory_summary", {}

        # 2. Traceability intent
        if "traceability" in text_lower or "trace" in text_lower or "provenance" in text_lower:
            if batch_id:
                return "batch_traceability", "get_batch_traceability", {"batch_id": batch_id}
            return "batch_traceability", "get_batch_traceability", {}

        # 3. Batch lookup / verified status intent
        if batch_id or "verified" in text_lower or "is batch" in text_lower or "ye batch" in text_lower:
            if batch_id:
                return "batch_lookup", "get_batch", {"batch_id": batch_id}

        # 4. Farmer intent
        if farmer_id:
            # Summary vs batch list
            if any(w in text_lower for w in ["summary", "total quantity", "total stock", "how much", "kitni quantity", "kitna stock"]):
                return "farmer_summary", "get_farmer_summary", {"farmer_id": farmer_id}
            else:
                return "farmer_batches", "get_farmer_batches", {"farmer_id": farmer_id}

        # 5. Herb intent
        herb_name = self.extract_herb_name(text)
        if herb_name and herb_name.lower() not in {"total", "system", "inventory"}:
            if any(w in text_lower for w in ["how many", "all batches", "show me all", "kitne batch", "kitne batches", "list"]):
                return "herb_batches", "get_herb_batches", {"herb_name": herb_name}
            else:
                return "herb_summary", "get_herb_summary", {"herb_name": herb_name}

        return "general_query", None, {}
