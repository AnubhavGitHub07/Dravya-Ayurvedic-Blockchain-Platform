import json
import pytest
from PIL import Image
import numpy as np

from src.models.config import ModelConfig
from src.models.plant_classifier import PlantClassifier
from src.training.trainer import ModelTrainer
from src.training.dataset import DravyaDataset
from src.inference.predictor import PlantPredictor
from torch.utils.data import DataLoader


@pytest.fixture
def trained_dummy_model(tmp_path):
    models_dir = tmp_path / "models"
    records = [
        {"canonical_name": "Clerodendrum splendens", "mapping_status": "APPROVED"},
        {"canonical_name": "Saraca asoca", "mapping_status": "APPROVED"},
    ]
    dataset = DravyaDataset(records=records)
    config = ModelConfig(models_dir=str(models_dir), model_version="v1-test", epochs=1, batch_size=2)

    model = PlantClassifier(num_classes=2, pretrained=False)
    loader = DataLoader(dataset, batch_size=2)

    trainer = ModelTrainer(
        model=model,
        config=config,
        class_to_idx=dataset.class_to_idx,
        idx_to_class=dataset.idx_to_class,
        train_loader=loader,
        val_loader=loader,
    )

    summary = trainer.train()
    return models_dir, "v1-test"


def test_plant_predictor_output_format(trained_dummy_model):
    models_dir, version = trained_dummy_model
    predictor = PlantPredictor(version=version, models_dir=models_dir, device="cpu")

    # Create synthetic test image
    arr = np.random.randint(0, 256, (224, 224, 3), dtype=np.uint8)
    test_img = Image.fromarray(arr)

    res = predictor.predict(test_img, top_k=2)

    assert "canonical_name" in res
    assert "confidence" in res
    assert "top_k" in res
    assert "model_version" in res
    assert "architecture" in res
    assert "num_classes" in res

    assert res["model_version"] == "v1-test"
    assert res["num_classes"] == 2
    assert len(res["top_k"]) == 2

    # Check confidence values format
    top_pred = res["top_k"][0]
    assert "canonical_name" in top_pred
    assert "confidence" in top_pred
    assert 0.0 <= top_pred["confidence"] <= 1.0

    # Top-k must be sorted descending by confidence
    assert res["top_k"][0]["confidence"] >= res["top_k"][1]["confidence"]
