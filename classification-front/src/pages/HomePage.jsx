import React, { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  Input,
  Button,
  Card,
  Row,
  Col,
  Typography,
  message,
  Spin,
  Tabs,
  Upload,
} from "antd";
import {
  DownloadOutlined,
  AimOutlined,
  VideoCameraOutlined,
  InboxOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Paragraph } = Typography;
const { Dragger } = Upload;
const baseURL = import.meta.env.VITE_API_BASE_URL || "";

const HomePage = () => {
  const location = useLocation();
  // State management
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const videoRef = useRef(null);

  React.useEffect(() => {
    if (location.state?.predefinedVideo) {
      const vid = location.state.predefinedVideo;
      setVideoData({
        id: vid.id,
        url: vid.url,
      });
    }
  }, [location.state]);

  // Handle Video Download
  const handleDownload = async () => {
    if (!videoUrl) return message.warning("Please enter an URL!");
    setIsLoading(true);
    setAiResult(null);
    try {
      const response = await axios.post(`${baseURL}/api/video/download/`, {
        url: videoUrl,
      });
      setVideoData({
        id: response.data.video_id,
        url: response.data.video_url,
      });
      message.success("Video loaded successfully!");
    } catch (error) {
      message.error("Failed to download video.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Frame Extraction from Video
  const handleProcessFrame = async () => {
    if (!videoRef.current || !videoData) return;
    setIsProcessing(true);
    setAiResult(null);
    try {
      const response = await axios.post(`${baseURL}/api/video/download/`, {
        video_id: videoData.id,
        timestamp: videoRef.current.currentTime,
      });
      setAiResult(response.data.predictions);
      message.success("Frame analyzed successfully!");
    } catch (error) {
      message.error("AI processing failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Direct Image Upload & Classification
  const handleImageUpload = async (options) => {
    const { file } = options;
    setIsProcessing(true);
    setAiResult(null);
    setPreviewImage(URL.createObjectURL(file)); // Show local preview instantly

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        `${baseURL}/api/image/classify/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setAiResult(response.data.predictions);
      message.success("Image classified successfully!");
    } catch (error) {
      message.error("Failed to classify image.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Tabs Configuration
  const tabItems = [
    {
      key: "1",
      label: (
        <span>
          <VideoCameraOutlined />
          Video Mode
        </span>
      ),
      children: !videoData ? (
        <Card hoverable style={{ borderRadius: "12px" }}>
          <div style={{ display: "flex", gap: "12px" }}>
            <Input
              placeholder="Paste video URL here..."
              size="large"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="primary"
              size="large"
              icon={<DownloadOutlined />}
              loading={isLoading}
              onClick={handleDownload}
            >
              Fetch Video
            </Button>
          </div>
        </Card>
      ) : (
        <Card title="Video Workspace" bordered={false}>
          <video
            ref={videoRef}
            src={videoData.url}
            controls
            style={{
              width: "100%",
              borderRadius: "8px",
              backgroundColor: "#000",
            }}
          />
          <Button
            type="primary"
            danger
            block
            size="large"
            icon={<AimOutlined />}
            loading={isProcessing}
            onClick={handleProcessFrame}
            style={{ marginTop: "16px", height: "45px", fontWeight: "bold" }}
          >
            Classify Current Frame
          </Button>
        </Card>
      ),
    },
    {
      key: "2",
      label: (
        <span>
          <PictureOutlined />
          Direct Image Mode
        </span>
      ),
      children: (
        <Card hoverable style={{ borderRadius: "12px" }}>
          <Dragger
            accept="image/*"
            customRequest={handleImageUpload}
            showUploadList={false}
            disabled={isProcessing}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: "#1890ff" }} />
            </p>
            <p className="ant-upload-text">
              Click or drag image file to this area to classify
            </p>
            <p className="ant-upload-hint">
              Supports PNG, JPG, JPEG files for instant PyTorch Inference.
            </p>
          </Dragger>
          {previewImage && (
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <img
                src={
                  previewImage
                    ? previewImage.startsWith("data:") ||
                      previewImage.startsWith("blob:") ||
                      previewImage.startsWith("http")
                      ? previewImage
                      : `${baseURL}${previewImage}`
                    : ""
                }
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "250px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                }}
              />
            </div>
          )}
        </Card>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <Title level={2}>🧠 Multimodal AI Classifier</Title>
        <Paragraph style={{ color: "#666" }}>
          Analyze objects inside videos or upload photos directly into our Deep
          Learning Model.
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Workspace: Tabs for Video or Image */}
        <Col xs={24} md={14}>
          <Tabs
            defaultActiveKey="1"
            items={tabItems}
            type="card"
            size="large"
            onChange={() => {
              setAiResult(null);
              setPreviewImage(null);
            }}
          />
        </Col>

        {/* Right Workspace: AI Predictions */}
        <Col xs={24} md={10} style={{ marginTop: "40px" }}>
          <Card
            title="AI Ensemble Analysis"
            style={{
              borderRadius: "12px",
              minHeight: "380px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            {isProcessing && (
              <div style={{ textAlign: "center", paddingTop: "80px" }}>
                <Spin size="large" tip="Running PyTorch inference..." />
              </div>
            )}

            {!isProcessing && !aiResult && (
              <div
                style={{
                  textAlign: "center",
                  color: "#999",
                  paddingTop: "100px",
                }}
              >
                <AimOutlined
                  style={{
                    fontSize: "48px",
                    marginBottom: "16px",
                    color: "#ccc",
                  }}
                />
                <p>Perform an action on the left to see Top-5 predictions.</p>
              </div>
            )}

            {!isProcessing && aiResult && (
              <div>
                <Title
                  level={4}
                  style={{ marginBottom: "20px", color: "#52c41a" }}
                >
                  🚀 Top 5 Predictions:
                </Title>
                {aiResult.map((pred, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px",
                      backgroundColor: index === 0 ? "#f6ffed" : "#f5f5f5",
                      borderLeft:
                        index === 0 ? "4px solid #52c41a" : "4px solid #d9d9d9",
                      borderRadius: "4px",
                      marginBottom: "8px",
                      fontWeight: index === 0 ? "bold" : "normal",
                    }}
                  >
                    <span>
                      {index + 1}. {pred.class}
                    </span>
                    <span style={{ color: index === 0 ? "#52c41a" : "#666" }}>
                      {pred.confidence}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;
