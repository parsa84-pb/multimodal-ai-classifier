from django.urls import path
from .views import upload_video_link, process_video_frame, get_all_frames, get_frame_detail, upload_and_classify_image, \
    get_all_videos

urlpatterns = [
    path('video/download/', upload_video_link, name='video-download'),
    path('frame/process/', process_video_frame, name='frame-process'),
    path('frames/', get_all_frames, name='all-frames'),
    path('frames/<int:frame_id>/', get_frame_detail, name='frame-detail'),
    path('image/classify/', upload_and_classify_image, name='image-classify'),
    path('videos/', get_all_videos, name='all-videos'),
]
