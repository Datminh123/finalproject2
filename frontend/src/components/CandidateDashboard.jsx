import React from 'react';
import { Row, Col, Card, Statistic, List, Typography, Tag, Skeleton, Spin } from 'antd';
import { useApplications } from '../hooks/useApplications';
import { useAuth } from '../hooks/useAuth';

const { Title } = Typography;

export const CandidateDashboard = () => {
  const { applications, loading } = useApplications();
  const { user } = useAuth();

  const myApplications = applications.filter(app => app.candidateEmail === user.email);
  const acceptedCount = myApplications.filter(app => app.status === 'accepted').length;
  const pendingCount = myApplications.filter(app => app.status === 'pending').length;

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>Tổng quan hoạt động</Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {loading ? <Skeleton active paragraph={false} /> : (
              <Statistic title="Đơn đã nộp" value={myApplications.length} prefix="📄" />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {loading ? <Skeleton active paragraph={false} /> : (
              <Statistic title="Đang chờ duyệt" value={pendingCount} prefix="⏳" valueStyle={{ color: '#faad14' }} />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {loading ? <Skeleton active paragraph={false} /> : (
              <Statistic title="Được chấp nhận" value={acceptedCount} prefix="🎉" valueStyle={{ color: '#52c41a' }} />
            )}
          </Card>
        </Col>
      </Row>

      <Card
  title="🕒 Hoạt động gần đây"
  bordered={false}
  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
>
  <List
    loading={loading}
    dataSource={
      [...myApplications]
        .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
        .slice(0, 5)
    }
    renderItem={(item) => (
      <List.Item>
        <List.Item.Meta
          title={`Bạn đã nộp đơn ứng tuyển cho công việc ở công ty ${item.jobId?.company}`}
          description={`Thời gian: ${new Date(item.appliedDate).toLocaleString("vi-VN")}`}
        />

        <Tag
          color={
            item.status === "accepted"
              ? "green"
              : item.status === "rejected"
              ? "red"
              : "orange"
          }
        >
          {item.status === "accepted"
            ? "Đã chấp nhận"
            : item.status === "rejected"
            ? "Đã từ chối"
            : "Chờ duyệt"}
        </Tag>
      </List.Item>
    )}
    locale={{ emptyText: "Chưa có hoạt động nào" }}
  />
</Card>
    </div>
  );
};