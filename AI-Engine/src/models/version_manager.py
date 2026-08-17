import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional, Union

from src.data.paths import load_config, get_project_root, get_models_dir
from src.data.taxonomy_review import atomic_json_write


class ModelVersionManager:
    """
    Model Versioning & Lifecycle Registry for Dravya AI Engine.
    Supports version listing, metric comparison across model iterations (v1, v2, v3...),
    active model promotion, and version rollback capability.
    """

    def __init__(self, models_dir: Optional[Union[str, Path]] = None):
        if models_dir:
            self.models_dir = Path(models_dir)
        else:
            self.models_dir = get_models_dir().resolve()

        self.models_dir.mkdir(parents=True, exist_ok=True)
        self.active_pointer_file = self.models_dir / "active_model.json"

    def get_version_dir(self, version: str) -> Path:
        return self.models_dir / version

    def list_versions() -> List[Dict[str, Any]]:
        pass

    def list_versions(self) -> List[Dict[str, Any]]:
        versions = []
        if not self.models_dir.exists():
            return versions

        for child in sorted(self.models_dir.iterdir()):
            if child.is_dir():
                meta_file = child / "model_metadata.json"
                class_file = child / "class_mapping.json"
                checkpoint_file = child / "best_model.pth"
                if not checkpoint_file.exists():
                    checkpoint_file = child / "latest_checkpoint.pth"

                if meta_file.exists():
                    try:
                        with open(meta_file, "r", encoding="utf-8") as f:
                            meta = json.load(f)
                    except Exception:
                        meta = {}
                else:
                    meta = {}

                num_classes = None
                if class_file.exists():
                    try:
                        with open(class_file, "r", encoding="utf-8") as f:
                            c_map = json.load(f)
                            num_classes = len(c_map.get("class_to_idx", {}))
                    except Exception:
                        pass

                is_active = self.get_active_version() == child.name

                versions.append(
                    {
                        "version": child.name,
                        "path": str(child),
                        "has_checkpoint": checkpoint_file.exists(),
                        "num_classes": num_classes,
                        "architecture": meta.get("architecture"),
                        "created_at": meta.get("created_at"),
                        "metrics": meta.get("val_metrics", {}),
                        "is_active": is_active,
                    }
                )

        return versions

    def get_metadata(self, version: str) -> Dict[str, Any]:
        v_dir = self.get_version_dir(version)
        meta_file = v_dir / "model_metadata.json"
        if not meta_file.exists():
            raise FileNotFoundError(f"No metadata found for version '{version}' at {meta_file}")
        with open(meta_file, "r", encoding="utf-8") as f:
            return json.load(f)

    def compare_versions(self, version_a: str, version_b: str) -> Dict[str, Any]:
        meta_a = self.get_metadata(version_a)
        meta_b = self.get_metadata(version_b)

        metrics_a = meta_a.get("val_metrics", {})
        metrics_b = meta_b.get("val_metrics", {})

        return {
            "version_a": {
                "version": version_a,
                "architecture": meta_a.get("architecture"),
                "epochs": meta_a.get("epochs"),
                "metrics": metrics_a,
                "created_at": meta_a.get("created_at"),
            },
            "version_b": {
                "version": version_b,
                "architecture": meta_b.get("architecture"),
                "epochs": meta_b.get("epochs"),
                "metrics": metrics_b,
                "created_at": meta_b.get("created_at"),
            },
            "comparison": {
                "accuracy_diff": round(
                    metrics_b.get("accuracy", 0.0) - metrics_a.get("accuracy", 0.0), 4
                ),
                "f1_score_diff": round(
                    metrics_b.get("f1_score", 0.0) - metrics_a.get("f1_score", 0.0), 4
                ),
                "loss_diff": round(
                    metrics_b.get("loss", 0.0) - metrics_a.get("loss", 0.0), 4
                ),
            },
        }

    def set_active_version(self, version: str) -> str:
        v_dir = self.get_version_dir(version)
        if not v_dir.exists():
            raise FileNotFoundError(f"Version directory '{version}' does not exist at {v_dir}")

        pointer_data = {
            "active_version": version,
            "promoted_at": datetime.now(timezone.utc).isoformat(),
            "models_dir": str(self.models_dir),
        }
        atomic_json_write(self.active_pointer_file, pointer_data)
        return version

    def get_active_version(self) -> Optional[str]:
        if self.active_pointer_file.exists():
            try:
                with open(self.active_pointer_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    return data.get("active_version")
            except Exception:
                pass
        return None

    def rollback(self, target_version: str) -> str:
        """
        Rollback active model pointer to a previous validated version.
        """
        return self.set_active_version(target_version)
