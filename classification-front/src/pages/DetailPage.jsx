import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Spin, Progress, Typography, Tag, Space, Descriptions } from 'antd';
import { ArrowLeftOutlined, BarChartOutlined, ClockCircleOutlined, LinkOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Paragraph, Text } = Typography;
const baseURL = import.meta.env.VITE_API_BASE_URL || '';

const DetailPage = () => {
  const { frameId } = useParams();
  const navigate = useNavigate();
  const [frameData, setFrameData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/frames/${frameId}/`);
        setFrameData(response.data);
      } catch (error) {
        console.error("Error loading frame details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [frameId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 0' }}>
        <Spin size="large" tip="Compiling Deep Learning Reports..." />
      </div>
    );
  }

  // Check if it was an uploaded image or video frame
  const isDirectUpload = !frameData.video_source_url;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Back Button */}
      <Button 
        type="link" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/gallery')}
        style={{ padding: 0, marginBottom: '20px', fontSize: '15px' }}
      >
        Back to Gallery
      </Button>

      <Row gutter={[32, 32]}>
        {/* Left Column: Big Visual Presentation */}
        <Col xs={24} md={12}>
          <Card bordered={false} style={{ background: '#fafafa', borderRadius: '16px', overflow: 'hidden', textAlign: 'center', padding: '10px' }}>
            <img 
              src={frameData.frame_image ? (frameData.frame_image.startsWith('http') ? frameData.frame_image : `${baseURL}${frameData.frame_image}`) : ''}
              alt="Analysis Core" 
              style={{ maxWidth: '100%', maxHeight: '420px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} 
            />
            
            <Descriptions title="Source Metadata" column={1} style={{ marginTop: '24px', textAlign: 'left' }} layout="horizontal" bordered size="small">
              <Descriptions.Item label="Source Type">
                <Tag color={isDirectUpload ? 'blue' : 'purple'}>{isDirectUpload ? 'Direct Photo Upload' : 'Video Frame'}</Tag>
              </Descriptions.Item>
              {!isDirectUpload && (
                <>
                  <Descriptions.Item label="Timestamp">
                    <Space><ClockCircleOutlined />{frameData.timestamp.toFixed(2)} seconds</Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Original Video">
                    <a href={frameData.video_source_url} target="_blank" rel="noreferrer"><LinkOutlined /> Open Original Video</a>
                  </Descriptions.Item>
                </>
              )}
              <Descriptions.Item label="Processed Date">
                {new Date(frameData.created_at).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Right Column: AI Analytics Dashboard */}
        <Col xs={24} md={12}>
          <Card 
            title={<span><BarChartOutlined style={{ color: '#1890ff', marginRight: '10px' }} />PyTorch Ensemble Metrics</span>}
            style={{ borderRadius: '16px', height: '100%', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}
          >
            <Paragraph style={{ color: '#777', marginBottom: '24px' }}>
              Below are the Top-5 raw indices calculated by pooling softmax weights from ResNet50, EfficientNetB0, and MobileNetV3.
            </Paragraph>

            {frameData.predictions.map((pred, index) => {
              // Convert probability string "45.23%" to float 45.23 for progress bar
              const percentFloat = parseFloat(pred.confidence);
              
              return (
                <div key={index} style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <Text strong={index === 0} style={{ fontSize: index === 0 ? '16px' : '14px' }}>
                      {index + 1}. {pred.class}
                    </Text>
                    <Text type={index === 0 ? 'success' : 'secondary'} strong={index === 0}>
                      {pred.confidence}
                    </Text>
                  </div>
                  <Progress 
                    percent={percentFloat} 
                    showInfo={false} 
                    strokeColor={index === 0 ? '#52c41a' : index === 1 ? '#1890ff' : '#bfbfbf'}
                    status={index === 0 ? "active" : "normal"}
                    strokeWidth={index === 0 ? 10 : 7}
                  />
                </div>
              );
            })}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DetailPage;