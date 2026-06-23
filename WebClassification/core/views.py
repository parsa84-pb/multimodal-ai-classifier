import os
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage
from .models import Video, VideoFrame
from .utils import download_video, extract_frame_from_video, ensemble_predict_frame
from .serializers import VideoFrameListSerializer, VideoFrameDetailSerializer
from django.conf import settings


@api_view(['POST'])
def upload_video_link(request):
    """
    API endpoint to receive Aparat link, download it, and register in database.
    """
    url = request.data.get('url')
    if not url:
        return Response({"error": "URL parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        relative_video_path = download_video(url)
        video_obj = Video.objects.create(url=url, video_file=relative_video_path)

        return Response({
            "message": "Video downloaded successfully",
            "video_id": video_obj.id,
            "video_url": video_obj.video_file.url
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": f"Failed to download video: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def process_video_frame(request):
    """
    API endpoint to extract a frame at a timestamp and run AI classification.
    """
    video_id = request.data.get('video_id')
    timestamp = request.data.get('timestamp')

    if not video_id or timestamp is None:
        return Response({"error": "Both video_id and timestamp are required"}, status=status.HTTP_400_BAD_REQUEST)

    video_obj = get_object_or_404(Video, id=video_id)

    try:
        relative_frame_path = extract_frame_from_video(video_obj.video_file.name, float(timestamp))
        full_frame_path = os.path.join(settings.MEDIA_ROOT, relative_frame_path)

        ai_predictions = ensemble_predict_frame(full_frame_path)

        frame_obj = VideoFrame.objects.create(
            video=video_obj,
            timestamp=float(timestamp),
            frame_image=relative_frame_path,
            predictions=ai_predictions
        )

        return Response({
            "message": "Frame processed successfully",
            "frame_id": frame_obj.id,
            "frame_url": frame_obj.frame_image.url,
            "predictions": frame_obj.predictions
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": f"Failed to process frame: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_all_frames(request):
    """
    API endpoint to return all processed frames for the Gallery Page.
    """
    frames = VideoFrame.objects.all().order_by('-created_at')
    serializer = VideoFrameListSerializer(frames, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_frame_detail(request, frame_id):
    """
    API endpoint to return full details of a specific frame using its ID.
    """
    frame_obj = get_object_or_404(VideoFrame, id=frame_id)
    serializer = VideoFrameDetailSerializer(frame_obj)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def upload_and_classify_image(request):
    image_file = request.FILES.get('image')
    if not image_file:
        return Response({"error": "No image file provided"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # 1. Save file to storage
        file_name = default_storage.save(f"frames/{image_file.name}", image_file)
        full_image_path = os.path.join(settings.MEDIA_ROOT, file_name)

        # 2. Run PyTorch Ensemble inference
        ai_predictions = ensemble_predict_frame(full_image_path)

        # 3. Save to DB (video relation is skipped/Null for direct uploads)
        frame_obj = VideoFrame.objects.create(
            video=None,  # This is allowed now thanks to null=True
            timestamp=0.0,
            frame_image=file_name,
            predictions=ai_predictions
        )

        return Response({
            "message": "Image analyzed and saved successfully",
            "frame_id": frame_obj.id,  # We send ID for page 3 navigation
            "frame_url": frame_obj.frame_image.url,
            "predictions": frame_obj.predictions
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": f"Failed to process image: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_all_videos(request):
    """
    API endpoint to return all previously downloaded videos.
    """
    videos = Video.objects.all().order_by('-created_at')
    # Because it's a simple model, we can manually format the JSON without a separate serializer
    data = [{
        "id": v.id,
        "url": v.video_file.url,
        "original_url": v.url,
        "created_at": v.created_at
    } for v in videos]

    return Response(data, status=status.HTTP_200_OK)
