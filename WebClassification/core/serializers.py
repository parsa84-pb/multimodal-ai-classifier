from rest_framework import serializers
from .models import VideoFrame

class VideoFrameListSerializer(serializers.ModelSerializer):
    """Serializer for Gallery Page (Page 2) - lightweight data"""
    class Meta:
        model = VideoFrame
        fields = ['id', 'frame_image', 'created_at']

class VideoFrameDetailSerializer(serializers.ModelSerializer):
    """Serializer for Detail Page (Page 3) - full data including predictions"""
    video_url = serializers.CharField(source='video.video_file.url', read_only=True)
    video_source_url = serializers.CharField(source='video.url', read_only=True)

    class Meta:
        model = VideoFrame
        fields = ['id', 'video_url', 'video_source_url', 'timestamp', 'frame_image', 'predictions', 'created_at']