# 🧠 Multimodal AI Video & Image Classifier

An end-to-end, production-ready full-stack web application designed to extract, analyze, and classify video frames and uploaded images using a Deep Learning Ensemble. The project combines a high-performance **Django REST Framework** backend with an intuitive, interactive **Ant Design-powered React** frontend.

---

## 🎯 System Architecture & UI Overview

### 1. Interactive Core Workspace
The main dashboard offers seamless switching between Video and Direct Image analysis modes, complete with top-5 confidence breakdowns updated in real-time via PyTorch model predictions.

| Video Loading View | Direct Image Mode |
|:---:|:---:|
| ![Initial Video Workspace](images/Screenshot%202026-06-23%20192713.png) | ![Direct Image Analysis](images/Screenshot%202026-06-23%20192733.png) |

### 2. Live Video Frame Extraction
Extract and process discrete frames from active video files at exact timestamps. The backend executes inference over the targeted matrix instantaneously.

![Frame Classification Workspace](images/Screenshot%202026-06-23%20171947.png)

### 3. Deep Learning Analytics & Vaults
Review granular confidence scores alongside deep image structural analytics, or explore history catalogs across standard media galleries.

| Advanced Frame Metrics | Saved Video Library 

| ![Detailed Inference Metrics](images/Screenshot%202026-06-23%20192815.png) 

| Saved Video Library |

![Saved Video Gallery](images/Screenshot%202026-06-23%20192753.png) 

| Processed Frames Gallery |

![Processed Frames Catalog](images/Screenshot%202026-06-23%20192806.png) 

---

## 🚀 Key Features

* **Dual-Mode Inference Workflow:** Seamless execution paths targeting standard image files (drag-and-drop uploads) or dynamically sliced video sequence frames.
* **AI Ensemble Predictions:** Real-time prediction aggregation by pooling softmax weights from pre-trained architectures (**ResNet50**, **EfficientNet B0**, and **MobileNet V3**) loaded directly into deep-learning runtime pipelines.
* **Video Asset State Management:** Video caching mechanics enabling backend download persistence while supporting immediate frame indexing at fractional playback timestamps.
* **Persistent History Archives:** Dedicated UI catalog spaces tracking execution instances, confidence thresholds, asset metadata, and processed frame variations.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Vite, Ant Design (AntD), Axios, React Router
* **Backend:** Python, Django, Django REST Framework, SQLite
* **AI/ML Runtime:** PyTorch, Torchvision, ImageNet-trained Core Architectures
* **DevOps & Infrastructure:** Docker, Yarn Dependency Architecture

---

## 📁 Repository Directory Structure

```text
WebClassification/
├── classification-front/     # React & Ant Design Client Application
├── WebClassification/        # Django REST Framework & PyTorch Engine
└── images/                   # UI Documentation & Presentation Assets

```

---

## 💻 Local Deployment Guide

Follow these configuration breakdowns to bring up individual subsystem environments natively.

### Prerequisites

* Ensure Python (>= 3.10) and Node.js (>= 18) are initialized.
* For hardware acceleration, confirm a valid local CUDA ecosystem configuration.

---

### 1. Backend Subsystem Configurations

Navigate into the root backend module directory:

```bash
cd WebClassification

```

#### Option A: Native Python Deployment Environment

1. Instantiate and source a clean python virtual container environment:
```bash
python -m venv venv
# On Windows environments:
.\venv\Scripts\activate
# On macOS/Linux environments:
source venv/bin/activate

```


2. Provision core package dependencies:
```bash
pip install --upgrade pip
pip install -r requirements.txt

```


3. Initialize structural schema migration steps and spawn the service interface:
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver

```


The Django app will start running locally at `http://127.0.0.1:8000/`.

#### Option B: Containerized Docker Deployment

If you prefer using Docker to run the backend and its PyTorch models isolated inside a container environment:

1. Compile and build the target service configuration layer:
```bash
docker build -t ai-classifier-backend .

```


2. Initialize the isolated core runtime service container:
```bash
docker run -p 8000:8000 ai-classifier-backend

```



---

### 2. Frontend Client Deployment

Navigate into the targeted client UI application folder workspace:

```bash
cd classification-front

```

1. Install project dependencies using Yarn package manager:
```bash
yarn install

```


2. Establish a runtime environment mapping file configuration: Create a `.env` configuration template file inside the project root directory and attach the corresponding service network endpoint configuration:
```env
VITE_API_BASE_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)

```


3. Spin up the Vite engine local development cluster interface:
```bash
yarn dev



Open your browser and navigate to the address provided by Vite (typically `http://localhost:5173/`).



```
