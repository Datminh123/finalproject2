import React from 'react';
import { Table, Tag, Card, Button, Typography, Space } from 'antd';
import { useApplications } from '../hooks/useApplications';
import { useAuth } from '../hooks/useAuth';
import { useJobs } from '../hooks/useJobs';

const { Text } = Typography;

export const ApplicationManager = () => {
  const { applications, loading } = useApplications();
  const { jobs } = useJobs();
  const { user } = useAuth();
  const myApps = applications.filter(app => app.candidateEmail === user.email);
  const columns = [
    {
      title: 'Công việc',
      key: 'job',
      render: (_, record) => {
        const jobId = record.jobId?._id || record.jobId;
        const job = jobs.find(j => j._id === jobId || j.id === jobId);
        return (
          <Space orientation="vertical" size={0}>
            <Text strong>{job ? job.title : `Job #${jobId}`}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>{job?.company}</Text>
          </Space>
        );
      }
    },
    {
      title: 'Ngày ứng tuyển',
      dataIndex: 'appliedDate',
      key: 'appliedDate',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = { pending: 'orange', accepted: 'green', rejected: 'red' };
        const labels = { pending: 'Chờ duyệt', accepted: 'Đã nhận', rejected: 'Từ chối' };
        return <Tag color={colors[status] || 'default'}>{labels[status] || status}</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" href={record.resume} target="_blank">Xem CV</Button>
          {user.role === 'employer' && record.status === 'pending' && (
            <>
              <Button size="small" type="primary" ghost>Duyệt</Button>
              <Button size="small" danger ghost>Từ chối</Button>
            </>
          )}
        </Space>
      )
    }
  ].filter(item => !item.hidden);

  return (
    <Card title={user.role === 'employer' ? "👥 Quản lý danh sách ứng viên" : "📋 Đơn ứng tuyển của tôi"}>
      <Table 
        columns={columns} 
        dataSource={myApps} 
        rowKey="_id" 
        loading={loading}
        pagination={{ pageSize: 8 }}
      />
    </Card>
  );
};