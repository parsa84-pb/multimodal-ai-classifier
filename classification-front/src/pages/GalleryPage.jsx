import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Button, Spin, Empty, Typography } from "antd";
import {
  EyeOutlined,
  CalendarOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Paragraph } = Typography;
const baseURL = import.meta.env.VITE_API_BASE_URL || "";

const GalleryPage = () => {
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all items from Django
  useEffect(() => {
    const fetchFrames = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/frames/`);
        setFrames(response.data);
      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFrames();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" tip="Loading AI Gallery..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Page Header */}
      <div
        style={{
          marginBottom: "40px",
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: "20px",
        }}
      >
        <Title level={2} style={{ color: "#141414" }}>
          <PictureOutlined style={{ marginRight: "12px", color: "#52c41a" }} />
          Processed Frames Gallery
        </Title>
        <Paragraph style={{ color: "#666" }}>
          Explore the repository of all video snapshots and uploaded images
          analyzed by our PyTorch Ensemble core.
        </Paragraph>
      </div>

      {/* Empty State if no data */}
      {frames.length === 0 ? (
        <Empty
          description="No analyzed items found yet. Go back and process some images or videos!"
          style={{ padding: "60px 0" }}
        />
      ) : (
        // Clean Grid Layout
        <Row gutter={[24, 24]}>
          {frames.map((item) => (
            <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
              <Card
                hoverable
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
                }}
                cover={
                  <div
                    style={{
                      height: "180px",
                      overflow: "hidden",
                      backgroundColor: "#fafafa",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <img
                      alt="Analyzed Capture"
                      src={
                        item.frame_image
                          ? item.frame_image.startsWith("http")
                            ? item.frame_image
                            : `${baseURL}${item.frame_image}`
                          : ""
                      }
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.3s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.06)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                      onClick={() => navigate(`/frame/${item.id}`)}
                    />
                  </div>
                }
              >
                <div
                  style={{
                    marginBottom: "16px",
                    color: "#8c8c8c",
                    fontSize: "13px",
                  }}
                >
                  <CalendarOutlined style={{ marginRight: "6px" }} />
                  {new Date(item.created_at).toLocaleDateString()}
                </div>

                <Button
                  type="default"
                  icon={<EyeOutlined />}
                  block
                  style={{ borderRadius: "6px", fontWeight: "500" }}
                  onClick={() => navigate(`/frame/${item.id}`)}
                >
                  View Full Analytics
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default GalleryPage;
