import React, { useState } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Row, Col, Statistic, Input, Select, InputNumber, message, Skeleton, Spin } from 'antd';
import { useAuth } from '../hooks/useAuth';
import { useJobs } from '../hooks/useJobs';
import { useApplications } from '../hooks/useApplications';

const { Option } = Select;

const initialFormData = {
  title: '',
  company: '',
  city: '',
  salary: '',
  type: '',
  level: '',
  industry: '',
  experienceYears: 0,
  description: '',
  requirements: ''
};

export const EmployerDashboard = () => {
  const { jobs, addJob, updateJob, deleteJob } = useJobs();
  const { applications, updateApplicationStatus } = useApplications();
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingJob, setEditingJob] = useState(null); // null = tạo mới, object = sửa
  const [formData, setFormData] = useState({ ...initialFormData });

  const myJobs = jobs.filter(job => job.postedBy === user.email);
  const myApplications = applications.filter(app => {
    const appJobId = app.jobId?._id || app.jobId;
    return myJobs.some(job => job._id === appJobId);
  });

  // Mở modal tạo mới
  const openCreateModal = () => {
    setEditingJob(null);
    setFormData({ ...initialFormData });
    setModalVisible(true);
  };

  // Mở modal sửa
  const openEditModal = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      company: job.company || '',
      city: job.city || '',
      salary: job.salary || '',
      type: job.type || '',
      level: job.level || '',
      industry: job.industry || '',
      experienceYears: job.experienceYears || 0,
      description: job.description || '',
      requirements: job.requirements || ''
    });
    setModalVisible(true);
  };

  const handleSubmitJob = async () => {
    const { title, company, city, salary, type, level, industry, description, requirements } = formData;
    
    if (!title || !company || !city || !salary || !type || !level || !industry || !description || !requirements) {
      Modal.warning({ content: 'Vui lòng điền đầy đủ thông tin!' });
      return;
    }

    try {
      if (editingJob) {
        // Sửa job
        await updateJob(editingJob._id, { ...formData, postedBy: user.email });
        message.success('Cập nhật tin tuyển dụng thành công!');
      } else {
        // Tạo mới
        await addJob({ ...formData, postedBy: user.email, status: 'active', postedDate: new Date().toLocaleDateString() });
        message.success('Đăng tin tuyển dụng thành công!');
      }
      setModalVisible(false);
      setFormData({ ...initialFormData });
      setEditingJob(null);
    } catch (err) {
      message.error('Thao tác thất bại! Vui lòng thử lại.');
    }
  };

  const handleDeleteJob = (job) => {
    Modal.confirm({
      title: `Xóa tin "${job.title}"?`,
      content: 'Bạn có chắc chắn muốn xóa tin tuyển dụng này? Thao tác không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteJob(job._id);
          message.success('Đã xóa tin tuyển dụng!');
        } catch (err) {
          message.error('Xóa thất bại!');
        }
      }
    });
  };

  const handleUpdateStatus = async (record, newStatus) => {
    try {
      await updateApplicationStatus(record._id, newStatus);
      message.success(`Đã ${newStatus === 'accepted' ? 'chấp nhận' : 'từ chối'} ứng viên!`);
    } catch (err) {
      message.error('Cập nhật trạng thái thất bại!');
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const jobColumns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: 'Ngành nghề',
      dataIndex: 'industry',
      key: 'industry',
      render: (industry) => <Tag color="purple">{industry}</Tag>
    },
    {
      title: 'Địa điểm',
      dataIndex: 'city',
      key: 'city',
      render: (city) => <Tag color="blue">{city}</Tag>
    },
    {
      title: 'Mức lương',
      dataIndex: 'salary',
      key: 'salary'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Đang tuyển' : 'Đã đóng'}
        </Tag>
      )
    },
    {
      title: 'Ngày đăng',
      dataIndex: 'postedDate',
      key: 'postedDate'
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openEditModal(record)}>Sửa</Button>
          <Button type="link" danger onClick={() => handleDeleteJob(record)}>
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  const applicationColumns = [
    {
      title: 'Ứng viên',
      dataIndex: 'candidateName',
      key: 'candidateName',
      render: (name, record) => name || record.candidateEmail
    },
    {
      title: 'Email',
      dataIndex: 'candidateEmail',
      key: 'candidateEmail'
    },
    {
      title: 'Công việc',
      key: 'job',
      render: (_, record) => {
        const appJobId = record.jobId?._id || record.jobId;
        const job = jobs.find(j => j._id === appJobId);
        return job ? job.title : 'N/A';
      }
    },
    {
      title: 'Ngày ứng tuyển',
      dataIndex: 'appliedDate',
      key: 'appliedDate',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          pending: 'orange',
          accepted: 'green',
          rejected: 'red'
        };
        const labels = {
          pending: 'Chờ duyệt',
          accepted: 'Chấp nhận',
          rejected: 'Từ chối'
        };
        return <Tag color={colors[status]}>{labels[status] || status}</Tag>;
      }
    },
    {
      title: 'CV',
      dataIndex: 'resume',
      key: 'resume',
      render: (link) => link ? (
        <Button type="link" href={link} target="_blank" rel="noopener noreferrer">
          📄 Xem CV
        </Button>
      ) : 'Chưa có'
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            onClick={() => handleUpdateStatus(record, 'accepted')}
            disabled={record.status !== 'pending'}
          >
            Chấp nhận
          </Button>
          <Button 
            danger 
            size="small"
            onClick={() => handleUpdateStatus(record, 'rejected')}
            disabled={record.status !== 'pending'}
          >
            Từ chối
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            {!jobs ? <Skeleton active paragraph={false} /> : (
              <Statistic title="Tin tuyển dụng" value={myJobs.length} prefix="💼" />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            {!applications ? <Skeleton active paragraph={false} /> : (
              <Statistic title="Ứng viên" value={myApplications.length} prefix="👤" />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            {!applications ? <Skeleton active paragraph={false} /> : (
              <Statistic title="Chờ duyệt" value={myApplications.filter(a => a.status === 'pending').length} prefix="📄" />
            )}
          </Card>
        </Col>
      </Row>

      <Card 
        title="Tin tuyển dụng của tôi" 
        extra={
          <Button 
            type="primary"
            onClick={openCreateModal}
          >
            ➕ Đăng tin tuyển dụng
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        <Table 
          columns={jobColumns} 
          dataSource={myJobs} 
          rowKey="_id"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Card title="Danh sách ứng viên">
        <Table 
          columns={applicationColumns} 
          dataSource={myApplications} 
          rowKey="_id"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Modal
        title={editingJob ? "Sửa tin tuyển dụng" : "Đăng tin tuyển dụng mới"}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); setEditingJob(null); }}
        onOk={handleSubmitJob}
        okText={editingJob ? "Cập nhật" : "Đăng tin"}
        cancelText="Hủy"
        width={700}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>Tiêu đề công việc *</div>
          <Input 
            placeholder="Ví dụ: Senior Frontend Developer"
            value={formData.title}
            onChange={(e) => updateFormData('title', e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>Công ty *</div>
          <Input 
            placeholder="Tên công ty"
            value={formData.company}
            onChange={(e) => updateFormData('company', e.target.value)}
          />
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>Thành phố *</div>
              <Select 
                placeholder="Chọn thành phố"
                style={{ width: '100%' }}
                value={formData.city || undefined}
                onChange={(value) => updateFormData('city', value)}
              >
                <Option value="Hà Nội">Hà Nội</Option>
                <Option value="TP.HCM">TP. Hồ Chí Minh</Option>
                <Option value="Đà Nẵng">Đà Nẵng</Option>
                <Option value="Hải Phòng">Hải Phòng</Option>
                <Option value="Cần Thơ">Cần Thơ</Option>
              </Select>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>Ngành nghề *</div>
              <Select 
                placeholder="Chọn ngành nghề"
                style={{ width: '100%' }}
                value={formData.industry || undefined}
                onChange={(value) => updateFormData('industry', value)}
              >
                <Option value="IT">Công nghệ thông tin</Option>
                <Option value="Marketing">Marketing</Option>
                <Option value="Finance">Tài chính</Option>
                <Option value="Sales">Kinh doanh</Option>
                <Option value="Education">Giáo dục</Option>
                <Option value="Healthcare">Y tế</Option>
                <Option value="Design">Thiết kế</Option>
              </Select>
            </div>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>Mức lương *</div>
              <Input 
                placeholder="Ví dụ: 15-25 triệu"
                value={formData.salary}
                onChange={(e) => updateFormData('salary', e.target.value)}
              />
            </div>
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>Năm kinh nghiệm *</div>
              <Space.Compact style={{ width: '100%' }}>
                <InputNumber 
                  min={0}
                  max={20}
                  placeholder="Số năm"
                  style={{ width: '100%' }}
                  value={formData.experienceYears}
                  onChange={(value) => updateFormData('experienceYears', value || 0)}
                />
                <Button disabled>năm</Button>
              </Space.Compact>
            </div>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>Loại hình *</div>
              <Select 
                placeholder="Chọn loại hình"
                style={{ width: '100%' }}
                value={formData.type || undefined}
                onChange={(value) => updateFormData('type', value)}
              >
                <Option value="Full-time">Full-time</Option>
                <Option value="Part-time">Part-time</Option>
                <Option value="Remote">Remote</Option>
              </Select>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>Cấp bậc *</div>
              <Select 
                placeholder="Chọn cấp bậc"
                style={{ width: '100%' }}
                value={formData.level || undefined}
                onChange={(value) => updateFormData('level', value)}
              >
                <Option value="Junior">Junior</Option>
                <Option value="Middle">Middle</Option>
                <Option value="Senior">Senior</Option>
              </Select>
            </div>
          </Col>
        </Row>

        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>Mô tả công việc *</div>
          <Input.TextArea 
            rows={4} 
            placeholder="Mô tả chi tiết về công việc..."
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>Yêu cầu *</div>
          <Input.TextArea 
            rows={3} 
            placeholder="Yêu cầu về kỹ năng, kinh nghiệm..."
            value={formData.requirements}
            onChange={(e) => updateFormData('requirements', e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};