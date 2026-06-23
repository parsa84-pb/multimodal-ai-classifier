import os
import cv2
import torch
import yt_dlp
from PIL import Image
from django.conf import settings
from .apps import CoreConfig


def download_video(video_url):
    """
    Downloads video from yt-dlp and returns the relative path.
    """
    output_dir = os.path.join(settings.MEDIA_ROOT, 'videos')
    os.makedirs(output_dir, exist_ok=True)

    # Configure yt-dlp options
    ydl_opts = {
        'outtmpl': os.path.join(output_dir, '%(id)s.%(ext)s'),
        'format': 'best',
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=True)
        filename = ydl.prepare_filename(info)
        # Return relative path for Django FileField
        return os.path.relpath(filename, settings.MEDIA_ROOT)


def extract_frame_from_video(video_path, timestamp_seconds):
    """
    Extracts a frame at a specific timestamp using OpenCV and returns the frame path.
    """
    full_video_path = os.path.join(settings.MEDIA_ROOT, video_path)
    cap = cv2.VideoCapture(full_video_path)

    if not cap.isOpened():
        raise ValueError("Could not open video file")

    # Calculate frame number based on FPS and timestamp
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_number = int(fps * timestamp_seconds)

    # Set video reader to the specific frame
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
    ret, frame = cap.read()

    if not ret:
        cap.release()
        raise ValueError(f"Could not read frame at timestamp {timestamp_seconds}")

    # Save the extracted frame as an image
    frames_dir = os.path.join(settings.MEDIA_ROOT, 'frames')
    os.makedirs(frames_dir, exist_ok=True)

    frame_filename = f"frame_{os.path.basename(video_path)}_{frame_number}.jpg"
    full_frame_path = os.path.join(frames_dir, frame_filename)

    cv2.imwrite(full_frame_path, frame)
    cap.release()

    # Return relative path for Django ImageField
    return os.path.join('frames', frame_filename)


def ensemble_predict_frame(full_image_path, topk=5):
    """
    Runs raw ensemble inference on an extracted frame using core models.
    """
    # Load and convert image
    img = Image.open(full_image_path).convert('RGB')

    # Preprocess image using the app's global transform
    input_tensor = CoreConfig.transform(img).unsqueeze(0).to(CoreConfig.device)

    with torch.no_grad():
        # Get raw logits from all models
        output_res = CoreConfig.resnet(input_tensor)
        output_eff = efficientnet = CoreConfig.efficientnet(input_tensor)
        output_mob = CoreConfig.mobilenet(input_tensor)

        # Convert logits to probabilities
        prob_res = torch.nn.functional.softmax(output_res, dim=1)
        prob_eff = torch.nn.functional.softmax(output_eff, dim=1)
        prob_mob = torch.nn.functional.softmax(output_mob, dim=1)

        # Average probabilities (Soft Voting Ensemble)
        ensemble_probs = (prob_res + prob_eff + prob_mob) / 3.0

        # Extract top K results
        top5_prob, top5_catid = torch.topk(ensemble_probs, topk)

    results = []
    for i in range(topk):
        prob = top5_prob[0][i].item() * 100
        # Get the exact raw ImageNet class name
        class_name = CoreConfig.categories[top5_catid[0][i].item()]

        results.append({
            "class": class_name,
            "confidence": f"{prob:.2f}%"
        })

    return results
