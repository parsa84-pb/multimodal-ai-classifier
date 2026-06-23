from django.db import models


# Create your models here.


class Video(models.Model):
    url = models.URLField(max_length=500)
    video_file = models.FileField(upload_to='videos/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Video {self.id} - {self.url[:30]}"


class VideoFrame(models.Model):
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='frames', null=True, blank=True)
    timestamp = models.FloatField()  # Time in seconds when video was paused
    frame_image = models.ImageField(upload_to='frames/')
    predictions = models.JSONField()  # Stores top-5 classes and confidences
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Frame from Video {self.video.id} at {self.timestamp}s"
