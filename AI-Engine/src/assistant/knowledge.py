"""
Dravya Project Knowledge Base and Structured Retrieval Engine for Dravya AI Copilot.
Loads documentation, maintains topic indices, and synthesizes grounded explanations.
"""
from dataclasses import dataclass
import logging
from pathlib import Path
import re
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

# Canonical Knowledge Topics
TOPIC_OVERVIEW = "project_overview"
TOPIC_OBJECTIVE = "project_objective"
TOPIC_FEATURES = "project_features"
TOPIC_ARCHITECTURE = "project_architecture"
TOPIC_AI_ENGINE = "ai_engine"
TOPIC_HERB_ID = "herb_identification"
TOPIC_BLOCKCHAIN = "blockchain"
TOPIC_TRACEABILITY = "traceability_explanation"
TOPIC_WORKFLOW = "workflow"
TOPIC_TECH_STACK = "technology_stack"
TOPIC_MODEL_LIFECYCLE = "model_versioning"
TOPIC_FAQ = "faq"


@dataclass
class KnowledgeSnippet:
    topic: str
    title: str
    summary_en: str
    summary_hi: str
    details_en: str
    details_hi: str
    keywords: List[str]


# Embedded Canonical Knowledge Repository (Self-contained, grounded strictly in repository architecture)
KNOWLEDGE_REGISTRY: Dict[str, KnowledgeSnippet] = {
    TOPIC_OVERVIEW: KnowledgeSnippet(
        topic=TOPIC_OVERVIEW,
        title="Dravya Platform Overview & Problem Statement",
        summary_en=(
            "Dravya is an AI-powered botanical authentication and blockchain traceability platform "
            "for the Ayurvedic herb supply chain. It addresses raw herb adulteration, "
            "accidental species substitution, and opaque supply chains."
        ),
        summary_hi=(
            "Dravya ek AI-powered botanical identification aur blockchain traceability platform hai "
            "jo Ayurvedic herb supply chain me milawat aur species substitution ki samasya ko hal karta hai."
        ),
        details_en=(
            "Dravya is an enterprise-grade AI and blockchain platform designed to ensure authenticity, "
            "quality, and transparency in Ayurvedic medicine.\n\n"
            "Key Problems Solved:\n"
            "• Widespread species substitution and adulteration in raw herbs (e.g. Saraca asoca vs Polyalthia longifolia).\n"
            "• Opaque supply chains with unverified intermediaries and paper records.\n"
            "• Risk of contaminated or sub-potent herbal medicines reaching consumers.\n\n"
            "Core Solutions:\n"
            "• Instant deep learning species verification at harvest.\n"
            "• Hyperledger Fabric blockchain records for every lot inspection and lab certificate.\n"
            "• Consumer QR code verification for complete seed-to-shelf traceability."
        ),
        details_hi=(
            "Dravya ek AI aur blockchain-powered platform hai jo Ayurvedic aushadhiyon ki authenticity aur supply chain traceability sunishchit karta hai.\n\n"
            "Mukhya Samasya:\n"
            "• Ayurvedic jadibutiyon me milawat aur nakli paudhon ki substitution (jaise asli Saraca asoca ki jagah Polyalthia longifolia).\n"
            "• Supply chain me bichauliyon ke karan origin aur quality ka pata na chalna.\n\n"
            "Dravya ka Samadhan:\n"
            "• Khet par AI computer vision dwara jadibuti ki turant pehchan.\n"
            "• Hyperledger Fabric blockchain par har batch ka tamper-evident record.\n"
            "• Consumer ke liye QR code scan karke complete traceability dekhne ki suvidha."
        ),
        keywords=["what is dravya", "dravya kya hai", "problem", "overview", "kya karta hai", "objective", "purpose", "why dravya", "about dravya", "introduction"],
    ),
    TOPIC_OBJECTIVE: KnowledgeSnippet(
        topic=TOPIC_OBJECTIVE,
        title="Dravya Objectives & Purpose",
        summary_en=(
            "Dravya aims to eliminate herbal supply chain adulteration, guarantee genuine botanical identity, "
            "provide immutable audit trails, and ensure fair recognition for Ayurvedic farmers."
        ),
        summary_hi=(
            "Dravya ka mukhya uddeshya Ayurvedic herb supply chain me milawat rokna, genuine species verify karna aur transparent traceability dena hai."
        ),
        details_en=(
            "Dravya Core Objectives:\n\n"
            "1. Prevent Species Substitution: Use computer vision to accurately identify 82 medicinal species at harvest.\n"
            "2. Immutable Provenance: Anchor batch inspections and lab certificates to Hyperledger Fabric blockchain.\n"
            "3. Detect Data Tampering: Use SHA-256 cryptographic hashes to instantly flag altered records.\n"
            "4. Standardize Botanical Taxonomy: Harmonize vernacular names to scientific binomial taxonomy.\n"
            "5. Fair Farmer Recognition: Digitize batch ownership and provide verifiable source credentials."
        ),
        details_hi=(
            "Dravya ke Mukhya Uddeshya:\n\n"
            "1. Species Substitution Rokna: Khet par hi 82 Ayurvedic jadibutiyon ki satik pehchan karna.\n"
            "2. Immutable Provenance: Batch inspection aur lab test reports ko blockchain par surakshit karna.\n"
            "3. Data Tampering Rokna: Cryptographic SHA-256 hash dwara kisi bhi unauthorized badlav ko pakadna.\n"
            "4. Botanical Standardization: Vernacular naamo ko scientific botanical taxonomy se map karna.\n"
            "5. Farmer Recognition: Kisanon ko unke genuine utpadan ka digital pramaan dena."
        ),
        keywords=["objective", "goal", "purpose", "why created", "mission", "uddeshya", "kyun banaya"],
    ),
    TOPIC_FEATURES: KnowledgeSnippet(
        topic=TOPIC_FEATURES,
        title="Dravya Major Features & Capabilities",
        summary_en=(
            "Key features include visual AI herb identification (98.67% accuracy), deterministic batch management, "
            "tamper-evident blockchain traceability, role-based dashboards, and public QR verification."
        ),
        summary_hi=(
            "Mukhya features me AI herb identification (98.67% accuracy), batch management, blockchain traceability, "
            "multi-role dashboards aur public QR verification shamil hain."
        ),
        details_en=(
            "Major Features of Dravya:\n\n"
            "• Visual AI Herb Classification: Identifies 82 medicinal plant species from leaf photos with 98.67% test accuracy.\n"
            "• Botanical Taxonomy Resolution: Automatically maps common names to canonical scientific binomials.\n"
            "• Deterministic Batch Generation: Generates collision-resistant Batch IDs (DRAVYA-CODE-DATE-HASH).\n"
            "• Blockchain Traceability Anchoring: Builds cryptographic SHA-256 records anchored on Hyperledger Fabric.\n"
            "• Multi-Stakeholder Dashboards: Role-tailored portals for Producers, Verifiers, Testing Labs, Distributors, and Admins.\n"
            "• Public QR Verification: Instant consumer verification portal at /verify.\n"
            "• Dravya AI Copilot: Intelligent assistant for live inventory insights and project knowledge."
        ),
        details_hi=(
            "Dravya ke Mukhya Features:\n\n"
            "• AI Herb Identification: Patti ki photo se 82 medicinal species ki 98.67% accuracy ke sath pehchan.\n"
            "• Taxonomy Resolution: Local naamo ko official scientific naamo me map karna.\n"
            "• Deterministic Batch IDs: Har batch ke liye unique identification code.\n"
            "• Blockchain Traceability: Hyperledger Fabric par tamper-proof audit trail.\n"
            "• Role-Based Portals: Farmer, Verifier, Lab, Distributor aur Admin ke liye alag dashboards.\n"
            "• Public QR Code: /verify page par koi bhi consumer poori journey check kar sakta hai."
        ),
        keywords=["features", "capabilities", "kya features hain", "major features", "kya kya kar sakta hai", "functions"],
    ),
    TOPIC_ARCHITECTURE: KnowledgeSnippet(
        topic=TOPIC_ARCHITECTURE,
        title="System Architecture & Component Relations",
        summary_en=(
            "Dravya utilizes a multi-tier microservice architecture: Next.js 16 frontend, Express/PostgreSQL backend, "
            "FastAPI/PyTorch AI Engine, and Hyperledger Fabric blockchain."
        ),
        summary_hi=(
            "Dravya ka multi-tier architecture Next.js 16 frontend, Express/PostgreSQL backend, FastAPI/PyTorch AI Engine "
            "aur Hyperledger Fabric blockchain se milkar bana hai."
        ),
        details_en=(
            "Dravya System Architecture:\n\n"
            "1. Frontend Layer (/client): Next.js 16, React 19, TypeScript, Tailwind CSS with role-based access.\n"
            "2. Backend API (/server): Node.js, Express.js, Prisma ORM, PostgreSQL database for operational data and auth.\n"
            "3. AI Inference Engine (/AI-Engine): Python 3.12, FastAPI, PyTorch EfficientNet-B0 for plant identification & AI Copilot.\n"
            "4. Blockchain Layer (/blockchain): Hyperledger Fabric permissioned ledger for immutable state proofs and tamper detection."
        ),
        details_hi=(
            "Dravya System Architecture:\n\n"
            "1. Frontend (/client): Next.js 16, React 19, Tailwind CSS dwara banaya gaya responsive UI.\n"
            "2. Backend Server (/server): Node.js, Express, PostgreSQL aur Prisma ORM par aadharit business logic layer.\n"
            "3. AI Engine (/AI-Engine): Python FastAPI aur PyTorch EfficientNet-B0 dwara sanchalit identification service.\n"
            "4. Blockchain (/blockchain): Hyperledger Fabric permissioned ledger jo data integrity ensure karta hai."
        ),
        keywords=["architecture", "system architecture", "components", "design", "how built", "structure", "kaise bana hai", "backend frontend relationship"],
    ),
    TOPIC_AI_ENGINE: KnowledgeSnippet(
        topic=TOPIC_AI_ENGINE,
        title="AI Engine & Deep Learning Architecture",
        summary_en=(
            "The AI Engine uses a fine-tuned EfficientNet-B0 model (5.3M parameters, 16.75 MB) trained on 82 species, "
            "achieving 98.67% test accuracy with ~42 ms CPU latency."
        ),
        summary_hi=(
            "Dravya AI Engine me EfficientNet-B0 deep learning model hai jo 82 medicinal species par trained hai, "
            "aur 98.67% test accuracy ke sath ~42 ms me classify karta hai."
        ),
        details_en=(
            "Dravya AI Engine Architecture:\n\n"
            "• Neural Backbone: EfficientNet-B0 fine-tuned with custom Dropout (p=0.2) and Linear classification head.\n"
            "• Model Specs: 5.3 Million parameters, 16.75 MB checkpoint file.\n"
            "• Accuracy: 98.67% test accuracy across 82 Ayurvedic plant species (99.33% validation accuracy).\n"
            "• Inference Speed: ~42 ms CPU inference latency per image.\n"
            "• Image Pipeline: RGB validation, 224 x 224 resizing, ImageNet normalization, Softmax scoring.\n"
            "• Taxonomy Engine: Maps internal IDs to common and scientific names (e.g. Ashwagandha -> Withania somnifera)."
        ),
        details_hi=(
            "Dravya AI Engine Architecture:\n\n"
            "• Neural Network: EfficientNet-B0 architecture (5.3 Million parameters, 16.75 MB model size).\n"
            "• Accuracy: 98.67% test accuracy (82 Ayurvedic plant species par trained).\n"
            "• Speed: CPU par lagbhag 42 ms me inference complete hota hai.\n"
            "• Image Flow: Image validate hokar 224 x 224 pixels me convert hoti hai aur prediction score milta hai.\n"
            "• Botanical Mapping: Predicted class ko scientific name (jaise Withania somnifera) se link kiya jata hai."
        ),
        keywords=["ai engine", "model", "efficientnet", "deep learning", "accuracy", "parameters", "ai architecture", "how ai works", "neural network"],
    ),
    TOPIC_HERB_ID: KnowledgeSnippet(
        topic=TOPIC_HERB_ID,
        title="Herb Identification & Image Processing Flow",
        summary_en=(
            "Herb photos (up to 10MB) are processed via Pillow, resized to 224x224, normalized, and classified by EfficientNet-B0 "
            "to produce confidence scores and canonical botanical names."
        ),
        summary_hi=(
            "Kisan dwara upload ki gayi patti ki photo ko AI Engine validate karke 224x224 size me EfficientNet-B0 model dwara identify karta hai."
        ),
        details_en=(
            "How Herb Identification Works:\n\n"
            "1. Image Upload: Field photo submitted via /batches/create-from-image or /predict (JPEG/PNG/WebP, max 10MB).\n"
            "2. Preprocessing: Converts to RGB, resizes to 224 x 224, applies ImageNet normalization.\n"
            "3. EfficientNet-B0 Inference: Model calculates class logits transformed into probabilities.\n"
            "4. Taxonomy Mapping: Highest probability class is matched to canonical scientific names.\n"
            "5. Verification Gate: Confidence >= 90% is marked AI_CONFIRMED; lower scores trigger REVIEW_REQUIRED."
        ),
        details_hi=(
            "Herb Identification Kaise Kaam Karta Hai:\n\n"
            "1. Photo Upload: Kisan patti ki photo upload karta hai.\n"
            "2. Preprocessing: Image ko 224 x 224 pixels me resize aur normalize kiya jata hai.\n"
            "3. Model Inference: EfficientNet-B0 model 82 species me se accurate match nikalta hai.\n"
            "4. Taxonomy Resolution: Predicted class ko scientific botanical name se link kiya jata hai.\n"
            "5. Confidence Status: Agar confidence 90% se zyada hai toh batch AI_CONFIRMED ho jata hai."
        ),
        keywords=["herb identification", "identify herb", "how identification works", "photo identification", "image processing", "predict herb", "pehchan kaise"],
    ),
    TOPIC_BLOCKCHAIN: KnowledgeSnippet(
        topic=TOPIC_BLOCKCHAIN,
        title="Blockchain Layer & Cryptographic Anchoring",
        summary_en=(
            "Dravya uses Hyperledger Fabric permissioned blockchain to record immutable SHA-256 state hashes "
            "for batch inspections, lab tests, and custody transfers, providing tamper detection."
        ),
        summary_hi=(
            "Dravya Hyperledger Fabric blockchain ka upyog karta hai jisme har inspection, lab test aur custody transfer ka SHA-256 hash store hota hai."
        ),
        details_en=(
            "Role of Blockchain in Dravya:\n\n"
            "1. Hyperledger Fabric Ledger:\n"
            "• Enterprise permissioned blockchain suitable for supply chain compliance.\n"
            "• High throughput, low latency, and zero cryptocurrency gas fees.\n\n"
            "2. What is Stored on Blockchain:\n"
            "• Milestone cryptographic SHA-256 hashes (payload_hash), not raw heavy images.\n"
            "• Batch creation, Lot inspection approval, Lab Quality Certificate (CoA), and Logistics transfers.\n\n"
            "3. Tamper Detection:\n"
            "• Scanning a QR code re-hashes live database records and compares them against the blockchain hash.\n"
            "• Any unauthorized modification immediately triggers a tampering alert."
        ),
        details_hi=(
            "Dravya me Blockchain ka Role:\n\n"
            "1. Hyperledger Fabric Ledger:\n"
            "• Permissioned enterprise blockchain jo fast aur gas-fee free hai.\n\n"
            "2. Blockchain par kya store hota hai:\n"
            "• Har milestone ka cryptographic SHA-256 hash (payload_hash).\n"
            "• Batch creation, Authority inspection, Lab quality approval aur Logistics events.\n\n"
            "3. Tamper Detection:\n"
            "• QR scan karne par database hash ko blockchain hash se compare kiya jata hai. Mismatch par tampering alert milta hai."
        ),
        keywords=["blockchain", "hyperledger fabric", "ledger", "role of blockchain", "tamper detection", "on-chain", "smart contract", "chaincode"],
    ),
    TOPIC_TRACEABILITY: KnowledgeSnippet(
        topic=TOPIC_TRACEABILITY,
        title="Traceability Architecture & SHA-256 Payload",
        summary_en=(
            "Traceability payloads combine herb taxonomy, farmer origin, quantity, AI verification metadata, "
            "and a deterministic 64-character SHA-256 digest."
        ),
        summary_hi=(
            "Traceability payload me herb species, farmer details, quantity, AI prediction aur 64-character SHA-256 hash hota hai."
        ),
        details_en=(
            "Traceability & Payload Structure:\n\n"
            "• Deterministic Batch ID: Format DRAVYA-CODE-DATE-HASH (e.g. DRAVYA-ASH-20260810-346DA7).\n"
            "• Payload Contents: Herb species, Farmer ID, quantity (kg), AI prediction score, status, harvest date, and 64-character SHA-256 payload hash."
        ),
        details_hi=(
            "Traceability Payload kya hai:\n\n"
            "• Deterministic Batch ID: Format DRAVYA-HERB_CODE-DATE-HASH.\n"
            "• Payload Data: Herb species, Farmer ID, quantity (kg), AI prediction score, status, aur 64-character SHA-256 hash jo tamper-evident hota hai."
        ),
        keywords=["traceability", "traceability payload", "payload_hash", "how traceability works", "traceability structure", "batch traceability"],
    ),
    TOPIC_WORKFLOW: KnowledgeSnippet(
        topic=TOPIC_WORKFLOW,
        title="Complete 5-Phase Farmer-to-Consumer Workflow",
        summary_en=(
            "The 5-phase workflow spans: 1) Producer registration, 2) Batch harvest & AI classification, "
            "3) Lab testing & CoA, 4) Logistics distribution, and 5) Public QR verification & tamper detection."
        ),
        summary_hi=(
            "Dravya ka 5-phase workflow: 1) Producer registration, 2) Harvest aur AI identification, "
            "3) Lab testing, 4) Distribution logistics, aur 5) Public QR verification."
        ),
        details_en=(
            "Complete Dravya Workflow (5 Phases):\n\n"
            "Phase 1: Registration & Farm Verification\n"
            "• Producer registers farm; Verification Authority inspects and approves farm on-chain.\n\n"
            "Phase 2: Cultivation & Harvest (Batch Creation)\n"
            "• Farmer captures leaf photo; AI Engine identifies species, assigns Batch ID, and Authority signs off lot inspection.\n\n"
            "Phase 3: Laboratory Testing\n"
            "• Certified lab tests for Heavy Metals, Pesticides, and Phytochemicals; anchors signed Certificate of Analysis (CoA).\n\n"
            "Phase 4: Distribution & Logistics\n"
            "• Batch transferred to logistics partner with digital custody tracking; final product QR code generated.\n\n"
            "Phase 5: Public QR Verification & Tamper Check\n"
            "• Consumers scan QR code at /verify to view full provenance and verify tamper status."
        ),
        details_hi=(
            "Dravya ka Poora Workflow (5 Phases):\n\n"
            "Phase 1: Registration & Verification: Kisan farm register karta hai aur Authority verify karti hai.\n\n"
            "Phase 2: Harvest & AI Identification: Patti ki photo se AI species identify karta hai aur batch banta hai.\n\n"
            "Phase 3: Lab Testing: Certified lab me Heavy Metals aur Pesticides test hokar CoA report blockchain par jati hai.\n\n"
            "Phase 4: Distribution: Logistics partner delivery track karta hai aur QR code banta hai.\n\n"
            "Phase 5: Public QR Verification: Consumer /verify par QR scan karke poora audit trail dekh sakta hai."
        ),
        keywords=["workflow", "complete workflow", "how dravya works", "kaise kaam karta hai", "supply chain flow", "steps", "journey", "farmer to consumer"],
    ),
    TOPIC_TECH_STACK: KnowledgeSnippet(
        topic=TOPIC_TECH_STACK,
        title="Dravya Technology Stack",
        summary_en=(
            "Built with Next.js 16, React 19, TypeScript, Tailwind CSS, Express.js, Prisma, PostgreSQL, "
            "Python 3.12, FastAPI, PyTorch, and Hyperledger Fabric."
        ),
        summary_hi=(
            "Dravya Next.js 16, React 19, Express.js, PostgreSQL, Python FastAPI, PyTorch aur Hyperledger Fabric se bana hai."
        ),
        details_en=(
            "Technology Stack Breakdown:\n\n"
            "• Frontend: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Zustand, React Query.\n"
            "• Backend: Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL, JWT Authentication.\n"
            "• AI Engine: Python 3.12, FastAPI, PyTorch 2.13, Pillow, Pydantic v2, EfficientNet-B0.\n"
            "• Blockchain: Hyperledger Fabric permissioned distributed ledger.\n"
            "• Testing & QA: PyTest, Jest, ESLint."
        ),
        details_hi=(
            "Technology Stack:\n\n"
            "• Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS.\n"
            "• Backend: Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL.\n"
            "• AI Engine: Python 3.12, FastAPI, PyTorch, EfficientNet-B0.\n"
            "• Blockchain: Hyperledger Fabric.\n"
            "• Testing: PyTest automated tests."
        ),
        keywords=["tech stack", "technology", "technologies used", "stack", "tools", "libraries", "frameworks", "kaunsi technology"],
    ),
    TOPIC_MODEL_LIFECYCLE: KnowledgeSnippet(
        topic=TOPIC_MODEL_LIFECYCLE,
        title="Model Lifecycle, Versioning & Promotion Gates",
        summary_en=(
            "The AI Engine enforces version isolation, atomic version pointers, "
            "automated evaluation gates (>=95% test accuracy), and instant rollback capabilities."
        ),
        summary_hi=(
            "AI Engine me model versioning pointer (active_model.json), automated quality gates (>=95% accuracy) aur instant rollback shamil hai."
        ),
        details_en=(
            "Model Lifecycle & Governance:\n\n"
            "1. Version Isolation: Every model version resides in models/<version_id>/ with its own weights, mapping, and metadata.\n"
            "2. Active Version Pointer: models/active_model.json atomically points to the active production model.\n"
            "3. Promotion Quality Gate: New models must achieve >= 95.0% test accuracy before deployment.\n"
            "4. Zero-Downtime Rollback: System can instantly revert to the previous version pointer without restarting containers."
        ),
        details_hi=(
            "Model Lifecycle & Versioning:\n\n"
            "1. Version Isolation: Har model version models/<version_id>/ me alag store hota hai.\n"
            "2. Active Pointer: active_model.json file active production model ko point karti hai.\n"
            "3. Quality Gate: Naya model promote karne se pehle minimum 95% test accuracy zaroori hai.\n"
            "4. Rollback: Problem aane par bina downtime purane model par instantly rollback kiya ja sakta hai."
        ),
        keywords=["model lifecycle", "model versioning", "promotion gate", "active_model.json", "update model", "rollback", "model update"],
    ),
}


class KnowledgeRetriever:
    """
    Structured query parser and grounded knowledge retriever for Dravya AI Copilot.
    """

    def __init__(self, docs_dir: Optional[Path] = None):
        self.docs_dir = docs_dir or (Path(__file__).resolve().parent.parent.parent / "docs" / "assistant")
        self.registry = KNOWLEDGE_REGISTRY

    def match_topic(self, text: str) -> Optional[str]:
        """
        Determines the primary knowledge topic matching the query.
        """
        text_clean = text.lower().strip()

        # 1. AI Engine / Role of AI
        if any(re.search(p, text_clean) for p in [
            r"\b(role of ai|ai role|ai in dravya|ai ka role|ai engine|efficientnet|deep learning|neural network|ai architecture|model architecture|explain the ai engine)\b",
        ]):
            return TOPIC_AI_ENGINE

        # 2. Herb Identification
        if any(re.search(p, text_clean) for p in [
            r"\b(how does herb identification|how ai identify|identify herb|identification work|image processing|leaf photo|pehchan kaise)\b",
        ]):
            return TOPIC_HERB_ID

        # 3. Blockchain / Role of Blockchain
        if any(re.search(p, text_clean) for p in [
            r"\b(role of blockchain|blockchain role|blockchain in dravya|blockchain ka role|hyperledger|hyperledger fabric|permissioned ledger|tamper detection|why blockchain)\b",
        ]):
            return TOPIC_BLOCKCHAIN

        # 4. Workflow / How it works
        if any(re.search(p, text_clean) for p in [
            r"\b(how does dravya work|how dravya works|complete workflow|workflow|supply chain flow|5 phases|five phases|farmer to consumer|kaise kaam karta hai|explain the complete workflow)\b",
        ]):
            return TOPIC_WORKFLOW

        # 5. Technology Stack
        if any(re.search(p, text_clean) for p in [
            r"\b(tech stack|technology stack|technologies used|what technologies|technologies and frameworks|frameworks|libraries|kaunsi technology)\b",
        ]):
            return TOPIC_TECH_STACK

        # 6. Model Versioning / Lifecycle
        if any(re.search(p, text_clean) for p in [
            r"\b(model version|model lifecycle|versioning|promotion gate|active_model|update model|rollback|model update|model versioning and promotion)\b",
        ]):
            return TOPIC_MODEL_LIFECYCLE

        # 7. Traceability Explanation
        if any(re.search(p, text_clean) for p in [
            r"\b(what is traceability|explain traceability|traceability payload|payload_hash|traceability mechanism|traceability structure|how is authenticity represented)\b",
        ]):
            return TOPIC_TRACEABILITY

        # 8. Architecture
        if any(re.search(p, text_clean) for p in [
            r"\b(architecture|system architecture|how is dravya built|backend frontend relationship|component interaction)\b",
        ]):
            return TOPIC_ARCHITECTURE

        # 9. Features
        if any(re.search(p, text_clean) for p in [
            r"\b(features|major features|key features|kya features|capabilities|kya kya kar sakta)\b",
        ]):
            return TOPIC_FEATURES

        # 10. Objective / Purpose / Problem
        if any(re.search(p, text_clean) for p in [
            r"\b(objective|purpose|why dravya|why was dravya created|uddeshya|kyun banaya|mission|problem does dravya solve|what problem does dravya solve)\b",
        ]):
            return TOPIC_OBJECTIVE

        # 11. Project Overview / Detail
        if any(re.search(p, text_clean) for p in [
            r"\b(what is dravya|explain dravya|about dravya|dravya kya hai|tell me about dravya|overview of dravya|explain dravya in detail)\b",
            r"\b(what does dravya do|dravya ke bare me|introduction to dravya)\b",
        ]):
            return TOPIC_OVERVIEW

        # Keyword matching fallback
        best_topic = None
        max_matches = 0
        for topic_key, snippet in self.registry.items():
            matches = sum(1 for kw in snippet.keywords if re.search(rf"\b{re.escape(kw)}\b", text_clean))
            if matches > max_matches:
                max_matches = matches
                best_topic = topic_key

        return best_topic if max_matches > 0 else None

    def get_answer(self, topic: str, is_hindi: bool = False, detailed: bool = False) -> str:
        """
        Retrieves grounded answer for a known topic in target language.
        """
        snippet = self.registry.get(topic)
        if not snippet:
            return (
                "Dravya ke uplabdh documentation me is bare me paryapt jankari uplabdh nahi hai."
                if is_hindi
                else "I don't have enough verified information in the current Dravya documentation to answer that accurately."
            )

        if is_hindi:
            return snippet.details_hi if detailed else snippet.details_hi
        return snippet.details_en if detailed else snippet.details_en

    def get_structured_deep_dive(self, is_hindi: bool = False) -> str:
        """
        Synthesizes a comprehensive multi-section SIH deep dive for 'Explain Dravya in detail'.
        """
        if is_hindi:
            return (
                "## 🌿 Dravya Ayurvedic Blockchain Platform — Complete Overview\n\n"
                "### 1. Dravya Kya Hai?\n"
                "Dravya ek enterprise-grade AI aur blockchain-powered platform hai jo Ayurvedic jadibutiyon ki supply chain me "
                "authenticity, quality assurance aur end-to-end traceability sunishchit karta hai.\n\n"
                "### 2. Samasya (Problem)\n"
                "- Jadibutiyon me nakli paudhon ki milawat (adulteration) aur accidental substitution.\n"
                "- Middlemen ke karan supply chain me transparency ki kami.\n"
                "- Paper-based lab reports me data tampering ka khatra.\n\n"
                "### 3. AI ka Role\n"
                "- EfficientNet-B0 model dwara 82 medicinal species ki 98.67% accuracy ke sath instant leaf image identification.\n"
                "- Botanical taxonomy harmonization (local naamo ko official scientific naamo me map karna).\n\n"
                "### 4. Blockchain ka Role\n"
                "- Hyperledger Fabric permissioned ledger par har batch ka SHA-256 cryptographic hash anchor hota hai.\n"
                "- Koi bhi unauthorized database badlav turant tamper alert trigger karta hai.\n\n"
                "### 5. 5-Phase Workflow\n"
                "1. Farmer Registration & Farm Inspection.\n"
                "2. Harvest & AI Camera Identification (Batch Creation).\n"
                "3. AYUSH-Certified Laboratory Testing (Heavy Metals, Pesticides, CoA).\n"
                "4. Logistics Distribution & GPS Tracking.\n"
                "5. Public QR Verification at `/verify`."
            )
        else:
            return (
                "## 🌿 Dravya Ayurvedic Blockchain Platform — Detailed Overview\n\n"
                "### 1. What is Dravya?\n"
                "**Dravya** is an enterprise-grade AI and blockchain platform designed to ensure authenticity, "
                "quality, and traceability in the Ayurvedic and herbal medicine supply chain.\n\n"
                "### 2. Problem Addressed\n"
                "- **Species Substitution & Adulteration**: Prevents raw drug adulteration (e.g. *Saraca asoca* vs *Polyalthia longifolia*).\n"
                "- **Opaque Supply Chains**: Replaces paper receipts with verifiable digital provenance.\n"
                "- **Data Tampering**: Eliminates fraudulent lab certificates through cryptographic blockchain proofs.\n\n"
                "### 3. Role of AI\n"
                "- **Deep Learning Identification**: Fine-tuned EfficientNet-B0 (5.3M parameters, 16.75 MB) classifying 82 medicinal species with **98.67% test accuracy** in ~42 ms.\n"
                "- **Taxonomy Resolution**: Canonical binomial botanical mapping.\n\n"
                "### 4. Role of Blockchain\n"
                "- **Hyperledger Fabric**: Anchors cryptographic SHA-256 hashes of batch creation, lot inspection, lab quality certificates, and custody transfers.\n"
                "- **Tamper Detection**: Dual-hash comparison flags unauthorized database modifications during consumer QR verification.\n\n"
                "### 5. Five-Phase Workflow\n"
                "1. **Producer Registration**: Farm details submitted and verified on-chain by regional authorities.\n"
                "2. **Harvest & AI ID**: Field photo classified by AI Engine; deterministic Batch ID generated.\n"
                "3. **Lab Quality Testing**: Analytical tests (Heavy Metals, Pesticides, Active Compounds) and signed CoA.\n"
                "4. **Distribution & Logistics**: Custody handoffs tracked to final destination.\n"
                "5. **Public QR Verification**: Instant verification at `/verify` for consumers and regulators."
            )
