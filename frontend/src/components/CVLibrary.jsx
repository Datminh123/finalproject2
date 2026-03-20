import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Tag, Typography, Skeleton, Empty, Space, message } from 'antd';
import { FilePdfOutlined, EyeOutlined, DownloadOutlined, UserOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

export const CVLibrary = () => {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCVs = async () => {
      try {
        const response = await fetch('https://69523b5b3b3c518fca11e64f.mockapi.io/applications');
        if (!response.ok) throw new Error('Không thể tải dữ liệu CV');
        const data = await response.json();
        setCvs(data);
      } catch (error) {
        console.error("Lỗi:", error);
        message.error("Không thể kết nối đến máy chủ!");
      } finally {
        setLoading(false);
      }
    };
    fetchCVs();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2} style={{ marginBottom: 24 }}>📂 Thư viện CV của tôi</Title>
      
      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : cvs.length > 0 ? (
        <Row gutter={[20, 20]}>
          {cvs.map((cv) => (
            <Col xs={24} sm={12} md={8} lg={6} key={cv.id}>
              <Card
                hoverable
                style={{ height: '100%', width: '100%', borderRadius: '12px', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}
                styles={{ body: { flex: 1, minWidth: 0 } }}
                actions={[
                  <Button type="link" icon={<EyeOutlined />} href={cv.resume} target="_blank">Xem</Button>,
                  <Button type="link" icon={<DownloadOutlined />}>Tải về</Button>
                ]}
              >
                <Card.Meta
                  avatar={<FilePdfOutlined style={{ fontSize: '32px', color: '#ff4d4f' }} />}
                  title={<div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}><Text strong>{cv.candidateName || 'CV Mẫu'}</Text></div>}
                  description={
                    <Space direction="vertical" size={0} style={{ width: '100%' }}>
                      <div 
                        style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} 
                        title={cv.candidateEmail}
                      >
                        <Text type="secondary"><UserOutlined /> {cv.candidateEmail}</Text>
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        {/* Hiển thị kỹ năng nếu có */}
                        <Tag color="blue">Kinh nghiệm: {cv.experienceYears || 0} năm</Tag>
                      </div>
                    </Space>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Empty description="Không có CV nào trong thư viện" />
      )}
    </div>
  );
};