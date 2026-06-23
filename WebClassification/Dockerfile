FROM python:3.11-slim

# Install necessary system audio/video dependencies for yt-dlp and OpenCV
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 \
    libxext6 \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

COPY . .

EXPOSE 7860


CMD ["sh", "-c", "python manage.py makemigrations && python manage.py migrate && python manage.py runserver 0.0.0.0:7860"]