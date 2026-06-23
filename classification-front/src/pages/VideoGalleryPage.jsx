import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Spin, Empty, Typography } from 'antd';
import { VideoCameraOutlined, CalendarOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Paragraph } = Typography;
const baseURL = import.meta.env.VITE_API_BASE_URL || '';

const VideoGalleryPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/videos/`);
        setVideos(response.data);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  // Shared function to handle redirecting to workspace
  const handleLoadVideo = (vid) => {
    navigate('/', { state: { predefinedVideo: vid } });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading Video Library..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px', borderBottom: '1px solid #f0f0f0', paddingBottom: '20px' }}>
        <Title level={2}>
          <VideoCameraOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
          Saved Video Library
        </Title>
        <Paragraph style={{ color: '#666' }}>
          Hover over any card to preview the video. Click anywhere on the card to instantly load it into the workspace.
        </Paragraph>
      </div>

      {videos.length === 0 ? (
        <Empty description="No videos found in the database yet." style={{ padding: '60px 0' }} />
      ) : (
        <Row gutter={[24, 24]}>
          {videos.map((vid) => (
            <Col xs={24} sm={12} md={8} key={vid.id}>
              <Card
                hoverable
                style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
                // Click anywhere on the card executes the load action!
                onClick={() => handleLoadVideo(vid)}
                cover={
                  <div style={{ height: '180px', backgroundColor: '#000', overflow: 'hidden', position: 'relative' }}>
                    <video
                      src={vid.url}
                      muted
                      loop
                      preload="metadata"
                      // Plays the video preview on hover (starts from second 0.1 to avoid a black screen frame)
                      onMouseEnter={(e) => {
                        e.currentTarget.currentTime = 0.1;
                        e.currentTarget.play().catch(err => console.log("Playback prevented"));
                      }}
                      // Pauses and resets when mouse leaves
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0.1;
                      }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                }
              >
                <Card.Meta 
                  title={`Video #${vid.id}`} 
                  description={
                    <div style={{ fontSize: '13px', marginTop: '5px' }}>
                      <Paragraph ellipsis={{ rows: 1 }} style={{ color: '#8c8c8c', marginBottom: '8px' }}>
                        Source: {vid.original_url}
                      </Paragraph>
                      <div style={{ color: '#bfbfbf' }}>
                        <CalendarOutlined style={{ marginRight: '6px' }} /> 
                        {new Date(vid.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default VideoGalleryPage;