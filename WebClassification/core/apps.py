import os
import torch
import torchvision.models as models
import torchvision.transforms as transforms
import urllib.request
from django.apps import AppConfig
from django.conf import settings

class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    device = None
    resnet = None
    efficientnet = None
    mobilenet = None
    transform = None
    categories = []

    def ready(self):
        # 1. Setup Device
        CoreConfig.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"--- AI Core using device: {CoreConfig.device} ---")

        # 2. Setup Paths and Remote URLs for PyTorch Official Weights
        weights_dir = os.path.join(settings.BASE_DIR, "weights")
        if not os.path.exists(weights_dir):
            os.makedirs(weights_dir)

        labels_path = os.path.join(settings.BASE_DIR, "imagenet_classes.txt")

        # Dictionary configuration mapping local paths to official download links
        models_metadata = {
            "resnet50": {
                "local_path": os.path.join(weights_dir, "resnet50-11ad3fa6.pth"),
                "url": "https://download.pytorch.org/models/resnet50-11ad3fa6.pth"
            },
            "efficientnet": {
                "local_path": os.path.join(weights_dir, "efficientnet_b0_rwightman-7f5810bc.pth"),
                "url": "https://download.pytorch.org/models/efficientnet_b0_rwightman-7f5810bc.pth"
            },
            "mobilenet": {
                "local_path": os.path.join(weights_dir, "mobilenet_v3_large-5c1a4163.pth"),
                "url": "https://download.pytorch.org/models/mobilenet_v3_large-5c1a4163.pth"
            }
        }

        # 3. Load Labels
        if os.path.exists(labels_path):
            with open(labels_path, "r") as f:
                CoreConfig.categories = [line.strip() for line in f.readlines()]
        else:
            print("[Warning] imagenet_classes.txt missing from project root!")

        # 4. Helper function to safely download weights with progress logs
        def download_weights_if_missing(model_name, meta):
            if not os.path.exists(meta["local_path"]):
                print(f"--- [Downloading] {model_name} weights from PyTorch servers... ---")
                try:
                    urllib.request.urlretrieve(meta["url"], meta["local_path"])
                    print(f"--- [Success] {model_name} weights downloaded successfully! ---")
                except Exception as e:
                    print(f"--- [Error] Failed to download {model_name} weights: {e} ---")

        # 5. Check and Download Missing Weights, then Load into Memory
        # Load ResNet50
        download_weights_if_missing("ResNet50", models_metadata["resnet50"])
        print("--- Loading ResNet50 into memory... ---")
        CoreConfig.resnet = models.resnet50()
        CoreConfig.resnet.load_state_dict(torch.load(models_metadata["resnet50"]["local_path"], map_location=CoreConfig.device))
        CoreConfig.resnet = CoreConfig.resnet.to(CoreConfig.device).eval()

        # Load EfficientNet B0
        download_weights_if_missing("EfficientNet B0", models_metadata["efficientnet"])
        print("--- Loading EfficientNet B0 into memory... ---")
        CoreConfig.efficientnet = models.efficientnet_b0()
        CoreConfig.efficientnet.load_state_dict(torch.load(models_metadata["efficientnet"]["local_path"], map_location=CoreConfig.device))
        CoreConfig.efficientnet = CoreConfig.efficientnet.to(CoreConfig.device).eval()

        # Load MobileNet V3
        download_weights_if_missing("MobileNet V3", models_metadata["mobilenet"])
        print("--- Loading MobileNet V3 into memory... ---")
        CoreConfig.mobilenet = models.mobilenet_v3_large()
        CoreConfig.mobilenet.load_state_dict(torch.load(models_metadata["mobilenet"]["local_path"], map_location=CoreConfig.device))
        CoreConfig.mobilenet = CoreConfig.mobilenet.to(CoreConfig.device).eval()

        # 6. Define optimized transform pipeline
        CoreConfig.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        print("--- All AI Models loaded and ready in memory! ---")