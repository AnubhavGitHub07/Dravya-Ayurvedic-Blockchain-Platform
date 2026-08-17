import io
import json
from pathlib import Path
from typing import Dict, List, Any, Optional, Union
from PIL import Image

import torch

from src.models.config import load_model_config
from src.models.plant_classifier import PlantClassifier
from src.models.version_manager import ModelVersionManager
from src.training.dataset import get_transforms


class PlantPredictor:
    """
    Production Inference Engine for Dravya AI Engine.
    Loads trained model weight checkpoints and class mappings from active/versioned models,
    preprocesses input images, and returns structured plant classification predictions with confidence scores.
    """

    def __init__(
        self,
        version: Optional[str] = None,
        checkpoint_name: str = "best_model.pth",
        device: Optional[str] = None,
        models_dir: Optional[Union[str, Path]] = None,
    ):
        self.version_manager = ModelVersionManager(models_dir)

        if not version:
            version = self.version_manager.get_active_version() or "v1"

        self.version = version
        self.version_dir = self.version_manager.get_version_dir(version)

        if not self.version_dir.exists():
            raise FileNotFoundError(
                f"Model version directory '{version}' not found at {self.version_dir}"
            )

        # 1. Load class mapping
        class_mapping_path = self.version_dir / "class_mapping.json"
        if not class_mapping_path.exists():
            raise FileNotFoundError(
                f"Class mapping file not found at {class_mapping_path}"
            )
        with open(class_mapping_path, "r", encoding="utf-8") as f:
            class_map_data = json.load(f)

        self.class_to_idx: Dict[str, int] = class_map_data.get("class_to_idx", {})
        self.idx_to_class: Dict[int, str] = {
            int(k): v for k, v in class_map_data.get("idx_to_class", {}).items()
        }
        self.num_classes = len(self.class_to_idx)

        # 1b. Load species taxonomy metadata mapping
        self.taxonomy_map: Dict[str, Dict[str, Any]] = {}
        tax_path = self.version_dir / "taxonomy_mapping.json"
        if tax_path.exists():
            try:
                with open(tax_path, "r", encoding="utf-8") as f:
                    self.taxonomy_map = json.load(f)
            except Exception:
                pass

        if not self.taxonomy_map:
            cand_path = Path(__file__).resolve().parent.parent.parent / "reports" / "dataset_analysis" / "candidate_training_classes_v2.json"
            if cand_path.exists():
                try:
                    with open(cand_path, "r", encoding="utf-8") as f:
                        cand_data = json.load(f)
                        for item in cand_data.get("candidate_classes", []):
                            cid = item.get("class_id")
                            if cid:
                                self.taxonomy_map[cid] = {
                                    "class_id": cid,
                                    "species_name": item.get("canonical_species_name"),
                                    "scientific_name": item.get("scientific_name"),
                                }
                except Exception:
                    pass

        # 2. Load model metadata & config
        meta_path = self.version_dir / "model_metadata.json"
        if meta_path.exists():
            with open(meta_path, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)
        else:
            self.metadata = {}

        self.architecture = self.metadata.get("architecture", "efficientnet_b0")
        self.image_size = self.metadata.get("config", {}).get("image_size", 224)

        # Device selection
        if device == "cuda" and torch.cuda.is_available():
            self.device = torch.device("cuda")
        elif device == "cpu":
            self.device = torch.device("cpu")
        else:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # 3. Instantiate model and load weights checkpoint
        checkpoint_path = self.version_dir / checkpoint_name
        if not checkpoint_path.exists():
            checkpoint_path = self.version_dir / "latest_checkpoint.pth"

        if not checkpoint_path.exists():
            raise FileNotFoundError(
                f"No model checkpoint found in {self.version_dir}"
            )

        self.model = PlantClassifier(
            num_classes=self.num_classes,
            architecture=self.architecture,
            pretrained=False,
        )

        checkpoint = torch.load(checkpoint_path, map_location=self.device)
        if isinstance(checkpoint, dict):
            state_dict = (
                checkpoint.get("model_state_dict")
                or checkpoint.get("state_dict")
                or checkpoint.get("model")
                or checkpoint.get("net")
                or checkpoint
            )
        else:
            state_dict = checkpoint

        if isinstance(state_dict, dict):
            cleaned_state_dict = {}
            for k, v in state_dict.items():
                name = k[7:] if k.startswith("module.") else k
                if name.startswith("backbone.classifier."):
                    name = name.replace("backbone.classifier.", "classifier.")
                cleaned_state_dict[name] = v
            state_dict = cleaned_state_dict

        self.model.load_state_dict(state_dict)
        self.model.to(self.device)
        self.model.eval()

        self.transform = get_transforms(image_size=self.image_size, is_training=False)

    def _prepare_image(self, image_input: Union[str, Path, Image.Image, bytes]) -> Image.Image:
        if isinstance(image_input, (str, Path)):
            img_path = Path(image_input)
            if not img_path.exists():
                raise FileNotFoundError(f"Input image not found: {img_path}")
            return Image.open(img_path).convert("RGB")
        elif isinstance(image_input, bytes):
            return Image.open(io.BytesIO(image_input)).convert("RGB")
        elif isinstance(image_input, Image.Image):
            return image_input.convert("RGB")
        else:
            raise TypeError(f"Unsupported image input type: {type(image_input)}")

    def predict(
        self,
        image_input: Union[str, Path, Image.Image, bytes],
        top_k: int = 5,
    ) -> Dict[str, Any]:
        """
        Executes model inference on input image and returns structured prediction dictionary.
        """
        pil_img = self._prepare_image(image_input)
        tensor = self.transform(pil_img).unsqueeze(0).to(self.device)

        with torch.no_grad():
            probs_tensor = self.model.predict_proba(tensor)[0]

        top_k_k = min(top_k, self.num_classes)
        top_probs, top_indices = torch.topk(probs_tensor, k=top_k_k)

        top_probs_list = top_probs.cpu().numpy().tolist()
        top_indices_list = top_indices.cpu().numpy().tolist()

        predictions = []
        for prob, idx in zip(top_probs_list, top_indices_list):
            raw_class_name = self.idx_to_class.get(idx, f"UNKNOWN_{idx}")
            tax_info = self.taxonomy_map.get(raw_class_name, {})
            species_name = tax_info.get("species_name") or raw_class_name
            scientific_name = tax_info.get("scientific_name")

            predictions.append(
                {
                    "class_name": species_name,
                    "canonical_name": species_name,
                    "class_id": raw_class_name,
                    "species_name": species_name,
                    "scientific_name": scientific_name,
                    "confidence": round(float(prob), 4),
                }
            )

        top_prediction = predictions[0] if predictions else {}

        return {
            "class_id": top_prediction.get("class_id"),
            "species_name": top_prediction.get("species_name"),
            "canonical_name": top_prediction.get("canonical_name"),
            "scientific_name": top_prediction.get("scientific_name"),
            "confidence": top_prediction.get("confidence", 0.0),
            "top_k": predictions,
            "model_version": self.version,
            "architecture": self.architecture,
            "num_classes": self.num_classes,
        }
