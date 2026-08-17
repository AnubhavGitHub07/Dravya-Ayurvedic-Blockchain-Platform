import os
from pathlib import Path
from typing import Dict, Optional, Union

try:
    import yaml
except ImportError:
    yaml = None

# AI-Engine Project Root (AI-Engine/)
PROJECT_ROOT = Path(__file__).resolve().parents[2]


def load_config() -> dict:
    """Load configuration from config.yaml with fallback to defaults."""
    if yaml is None:
        return {}
    config_path = Path(
        os.getenv("DRAVYA_CONFIG_PATH", PROJECT_ROOT / "configs" / "config.yaml")
    )
    if config_path.is_file():
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f) or {}
        except Exception:
            pass
    return {}



_CONFIG = load_config()


def get_project_root() -> Path:
    """Return the AI-Engine root directory."""
    return PROJECT_ROOT


def get_external_dataset_root() -> Path:
    """Return the raw dataset root directory path, supporting env var & config overrides."""
    env_path = os.getenv("DRAVYA_DATASET_ROOT") or os.getenv(
        "EXTERNAL_DATASET_ROOT_PATH"
    )
    if env_path:
        return Path(env_path)

    config_raw = _CONFIG.get("paths", {}).get("raw_datasets", "datasets/raw")
    config_path = Path(config_raw)
    if not config_path.is_absolute():
        return (PROJECT_ROOT / config_path).resolve()
    return config_path


def get_reports_dir() -> Path:
    """Return the reports output directory path, supporting env var & config overrides."""
    env_path = os.getenv("DRAVYA_REPORTS_DIR") or os.getenv("REPORTS_DIR_PATH")
    if env_path:
        return Path(env_path)

    config_reports = _CONFIG.get("paths", {}).get(
        "reports_dir", "reports/dataset_analysis"
    )
    config_path = Path(config_reports)
    if not config_path.is_absolute():
        return (PROJECT_ROOT / config_path).resolve()
    return config_path


def get_evaluation_reports_dir() -> Path:
    """Return the model evaluation reports output directory path, supporting env var & config overrides."""
    env_path = os.getenv("DRAVYA_EVALUATION_REPORTS_DIR") or os.getenv(
        "EVALUATION_REPORTS_DIR_PATH"
    )
    if env_path:
        return Path(env_path)

    config_eval = _CONFIG.get("paths", {}).get(
        "evaluation_reports_dir", "reports/model_evaluation"
    )
    config_path = Path(config_eval)
    if not config_path.is_absolute():
        return (PROJECT_ROOT / config_path).resolve()
    return config_path


def get_models_dir() -> Path:
    """Return the models directory path, supporting env var & config overrides."""
    env_path = os.getenv("DRAVYA_MODELS_DIR") or os.getenv("MODELS_DIR_PATH")
    if env_path:
        return Path(env_path)

    config_models = _CONFIG.get("paths", {}).get("model_output", "models")
    config_path = Path(config_models)
    if not config_path.is_absolute():
        return (PROJECT_ROOT / config_path).resolve()
    return config_path




def get_dataset_paths(
    root: Optional[Union[str, Path]] = None,
) -> Dict[str, Path]:
    """Return map of dataset IDs to dataset directory paths."""
    base = Path(root) if root else get_external_dataset_root()
    return {
        "CIMPd": base / "CIMPd",
        "Hugging_Face": base / "Hugging_Face",
        "Kaggle": base / "Kaggle",
    }


# Backward-compatible dynamic defaults
EXTERNAL_DATASET_ROOT = str(get_external_dataset_root())
DATASET_PATHS = get_dataset_paths()
DEFAULT_REPORTS_DIR = get_reports_dir()

SUPPORTED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
ARCHIVE_EXTENSIONS = {".zip", ".tar", ".gz", ".7z", ".rar", ".tgz"}
METADATA_EXTENSIONS = {".csv", ".json", ".jsonl", ".parquet", ".txt", ".xml"}
