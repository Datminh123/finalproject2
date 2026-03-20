import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, Table, Button, Tag, Space, Modal, Row, Col, Statistic, 
  Input, Select, Tabs, message, Skeleton, Spin, Popconfirm, Form
} from 'antd';
import { 
  UserOutlined, FileTextOutlined, TeamOutlined, 
  SearchOutlined, DeleteOutlined, EditOutlined, ReloadOutlined,
  DashboardOutlined, AppstoreOutlined
} from '@ant-design/icons';
import { adminAPI } from '../services/api';

const { Option } = Select;

export const AdminDashboard = () => {
  // ============ STATE ============
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Users
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPagination, setUsersPagination] = useState({ current: 1, pageSize: 8, total: 0 });
  const [usersSearch, setUsersSearch] = useState('');
  const [usersRoleFilter, setUsersRoleFilter] = useState('');

  // Jobs
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsPagination, setJobsPagination] = useState({ current: 1, pageSize: 8, total: 0 });
  const [jobsSearch, setJobsSearch] = useState('');

  // Applications
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsPagination, setAppsPagination] = useState({ current: 1, pageSize: 8, total: 0 });
  const [appsSearch, setAppsSearch] = useState('');
  const [appsStatusFilter, setAppsStatusFilter] = useState('');

  // Edit modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editType, setEditType] = useState(''); // 'user' | 'job'
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  // ============ FETCH FUNCTIONS ============
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const data = await adminAPI.getStats();
      setStats(data);
    } catch (err) {
      message.error('Lỗi tải thống kê!');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchUsers = useCallback(async (page = 1, pageSize = 8) => {
    setUsersLoading(true);
    try {
      const data = await adminAPI.getUsers({ page, limit: pageSize, keyword: usersSearch, role: usersRoleFilter });
      setUsers(data.data);
      setUsersPagination({ current: data.page, pageSize, total: data.total });
    } catch (err) {
      message.error('Lỗi tải danh sách người dùng!');
    } finally {
      setUsersLoading(false);
    }
  }, [usersSearch, usersRoleFilter]);

  const fetchJobs = useCallback(async (page = 1, pageSize = 8) => {
    setJobsLoading(true);
    try {
      const data = await adminAPI.getJobs({ page, limit: pageSize, keyword: jobsSearch });
      setJobs(data.data);
      setJobsPagination({ current: data.page, pageSize, total: data.total });
    } catch (err) {
      message.error('Lỗi tải danh sách công việc!');
    } finally {
      setJobsLoading(false);
    }
  }, [jobsSearch]);

  const fetchApplications = useCallback(async (page = 1, pageSize = 8) => {
    setAppsLoading(true);
    try {
      const data = await adminAPI.getApplications({ page, limit: pageSize, keyword: appsSearch, status: appsStatusFilter });
      setApplications(data.data);
      setAppsPagination({ current: data.page, pageSize, total: data.total });
    } catch (err) {
      message.error('Lỗi tải danh sách đơn ứng tuyển!');
    } finally {
      setAppsLoading(false);
    }
  }, [appsSearch, appsStatusFilter]);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchUsers(1); }, [fetchUsers]);
  useEffect(() => { fetchJobs(1); }, [fetchJobs]);
  useEffect(() => { fetchApplications(1); }, [fetchApplications]);

  // ============ HANDLERS ============
  const handleDeleteUser = async (id) => {
    try {
      await adminAPI.deleteUser(id);
      message.success('Đã xóa người dùng!');
      fetchUsers(usersPagination.current, usersPagination.pageSize);
      fetchStats();
    } catch (err) {
      message.error('Xóa thất bại!');
    }
  };

  const handleDeleteJob = async (id) => {
    try {
      await adminAPI.deleteJob(id);
      message.success('Đã xóa công việc!');
      fetchJobs(jobsPagination.current, jobsPagination.pageSize);
      fetchStats();
    } catch (err) {
      message.error('Xóa thất bại!');
    }
  };

  const handleDeleteApplication = async (id) => {
    try {
      await adminAPI.deleteApplication(id);
      message.success('Đã xóa đơn ứng tuyển!');
      fetchApplications(appsPagination.current, appsPagination.pageSize);
      fetchStats();
    } catch (err) {
      message.error('Xóa thất bại!');
    }
  };

  const openEditModal = (item, type) => {
    setEditingItem(item);
    setEditType(type);
    setEditForm({ ...item });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    setEditLoading(true);
    try {
      if (editType === 'user') {
        await adminAPI.updateUser(editingItem._id, editForm);
        message.success('Cập nhật người dùng thành công!');
        fetchUsers(usersPagination.current, usersPagination.pageSize);
      } else if (editType === 'job') {
        await adminAPI.updateJob(editingItem._id, editForm);
        message.success('Cập nhật công việc thành công!');
        fetchJobs(jobsPagination.current, jobsPagination.pageSize);
      }
      setEditModalVisible(false);
    } catch (err) {
      message.error('Cập nhật thất bại!');
    } finally {
      setEditLoading(false);
    }
  };

  // ============ TABLE COLUMNS ============
  const userColumns = [
    { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName', ellipsis: true },
    { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true },
    { 
      title: 'Vai trò', dataIndex: 'role', key: 'role',
      render: (role) => {
        const colors = { candidate: 'blue', employer: 'green', admin: 'red' };
        const labels = { candidate: 'Ứng viên', employer: 'Nhà tuyển dụng', admin: 'Admin' };
        return <Tag color={colors[role]}>{labels[role] || role}</Tag>;
      }
    },
    { title: 'SĐT', dataIndex: 'phone', key: 'phone', responsive: ['md'] },
    { 
      title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', responsive: ['lg'],
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'
    },
    {
      title: 'Hành động', key: 'action', width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record, 'user')}>Sửa</Button>
          <Popconfirm title="Xóa người dùng này?" onConfirm={() => handleDeleteUser(record._id)} okText="Xóa" cancelText="Hủy">
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const jobColumns = [
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: 'Công ty', dataIndex: 'company', key: 'company', ellipsis: true, responsive: ['md'] },
    { title: 'Ngành', dataIndex: 'industry', key: 'industry', render: (v) => <Tag color="purple">{v}</Tag> },
    { title: 'Thành phố', dataIndex: 'city', key: 'city', render: (v) => <Tag color="blue">{v}</Tag>, responsive: ['md'] },
    { title: 'Lương', dataIndex: 'salary', key: 'salary', responsive: ['lg'] },
    { 
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (s) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? 'Đang tuyển' : s || 'N/A'}</Tag>
    },
    {
      title: 'Hành động', key: 'action', width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record, 'job')}>Sửa</Button>
          <Popconfirm title="Xóa công việc này?" onConfirm={() => handleDeleteJob(record._id)} okText="Xóa" cancelText="Hủy">
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const appColumns = [
    { title: 'Ứng viên', dataIndex: 'candidateName', key: 'candidateName', ellipsis: true, render: (n, r) => n || r.candidateEmail },
    { title: 'Email', dataIndex: 'candidateEmail', key: 'candidateEmail', ellipsis: true, responsive: ['md'] },
    { 
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (s) => {
        const colors = { pending: 'orange', accepted: 'green', rejected: 'red' };
        const labels = { pending: 'Chờ duyệt', accepted: 'Đã chấp nhận', rejected: 'Đã từ chối' };
        return <Tag color={colors[s]}>{labels[s] || s}</Tag>;
      }
    },
    { 
      title: 'Ngày ứng tuyển', dataIndex: 'appliedDate', key: 'appliedDate', responsive: ['lg'],
      render: (d) => d ? new Date(d).toLocaleDateString('vi-VN') : 'N/A'
    },
    {
      title: 'Hành động', key: 'action', width: 80,
      render: (_, record) => (
        <Popconfirm title="Xóa đơn ứng tuyển này?" onConfirm={() => handleDeleteApplication(record._id)} okText="Xóa" cancelText="Hủy">
          <Button type="link" danger size="small" icon={<DeleteOutlined />}>Xóa</Button>
        </Popconfirm>
      )
    }
  ];

  // ============ RENDER ============
  const tabItems = [
    {
      key: 'users',
      label: <span><TeamOutlined /> Người dùng</span>,
      children: (
        <div>
          <Space style={{ marginBottom: 16, flexWrap: 'wrap' }} size="middle">
            <Input.Search
              placeholder="Tìm theo tên, email..."
              allowClear
              style={{ width: 280 }}
              prefix={<SearchOutlined />}
              onSearch={(v) => setUsersSearch(v)}
              onChange={(e) => { if (!e.target.value) setUsersSearch(''); }}
            />
            <Select placeholder="Lọc vai trò" allowClear style={{ width: 160 }}
              value={usersRoleFilter || undefined} onChange={(v) => setUsersRoleFilter(v || '')}
            >
              <Option value="candidate">Ứng viên</Option>
              <Option value="employer">Nhà tuyển dụng</Option>
              <Option value="admin">Admin</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={() => fetchUsers(1)}>Tải lại</Button>
          </Space>
          <Table 
            columns={userColumns}
            dataSource={users}
            rowKey="_id"
            loading={usersLoading}
            scroll={{ x: 600 }}
            pagination={{
              ...usersPagination,
              showSizeChanger: true,
              pageSizeOptions: ['5', '8', '10', '20'],
              showTotal: (total) => `Tổng: ${total} người dùng`,
              onChange: (p, ps) => fetchUsers(p, ps),
            }}
          />
        </div>
      ),
    },
    {
      key: 'jobs',
      label: <span><FileTextOutlined /> Công việc</span>,
      children: (
        <div>
          <Space style={{ marginBottom: 16, flexWrap: 'wrap' }} size="middle">
            <Input.Search
              placeholder="Tìm theo tiêu đề, công ty..."
              allowClear
              style={{ width: 280 }}
              prefix={<SearchOutlined />}
              onSearch={(v) => setJobsSearch(v)}
              onChange={(e) => { if (!e.target.value) setJobsSearch(''); }}
            />
            <Button icon={<ReloadOutlined />} onClick={() => fetchJobs(1)}>Tải lại</Button>
          </Space>
          <Table 
            columns={jobColumns}
            dataSource={jobs}
            rowKey="_id"
            loading={jobsLoading}
            scroll={{ x: 700 }}
            pagination={{
              ...jobsPagination,
              showSizeChanger: true,
              pageSizeOptions: ['5', '8', '10', '20'],
              showTotal: (total) => `Tổng: ${total} công việc`,
              onChange: (p, ps) => fetchJobs(p, ps),
            }}
          />
        </div>
      ),
    },
    {
      key: 'applications',
      label: <span><AppstoreOutlined /> Đơn ứng tuyển</span>,
      children: (
        <div>
          <Space style={{ marginBottom: 16, flexWrap: 'wrap' }} size="middle">
            <Input.Search
              placeholder="Tìm theo tên, email ứng viên..."
              allowClear
              style={{ width: 280 }}
              prefix={<SearchOutlined />}
              onSearch={(v) => setAppsSearch(v)}
              onChange={(e) => { if (!e.target.value) setAppsSearch(''); }}
            />
            <Select placeholder="Trạng thái" allowClear style={{ width: 160 }}
              value={appsStatusFilter || undefined} onChange={(v) => setAppsStatusFilter(v || '')}
            >
              <Option value="pending">Chờ duyệt</Option>
              <Option value="accepted">Đã chấp nhận</Option>
              <Option value="rejected">Đã từ chối</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={() => fetchApplications(1)}>Tải lại</Button>
          </Space>
          <Table 
            columns={appColumns}
            dataSource={applications}
            rowKey="_id"
            loading={appsLoading}
            scroll={{ x: 500 }}
            pagination={{
              ...appsPagination,
              showSizeChanger: true,
              pageSizeOptions: ['5', '8', '10', '20'],
              showTotal: (total) => `Tổng: ${total} đơn`,
              onChange: (p, ps) => fetchApplications(p, ps),
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statsLoading ? (
          <>
            <Col xs={12} sm={8} md={4}><Card><Skeleton active paragraph={false} /></Card></Col>
            <Col xs={12} sm={8} md={4}><Card><Skeleton active paragraph={false} /></Card></Col>
            <Col xs={12} sm={8} md={4}><Card><Skeleton active paragraph={false} /></Card></Col>
            <Col xs={12} sm={8} md={4}><Card><Skeleton active paragraph={false} /></Card></Col>
            <Col xs={12} sm={8} md={4}><Card><Skeleton active paragraph={false} /></Card></Col>
            <Col xs={12} sm={8} md={4}><Card><Skeleton active paragraph={false} /></Card></Col>
          </>
        ) : stats ? (
          <>
            <Col xs={12} sm={8} md={4}>
              <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Statistic title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Tổng người dùng</span>} value={stats.totalUsers} prefix={<TeamOutlined />} valueStyle={{ color: '#fff' }} />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <Statistic title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Ứng viên</span>} value={stats.totalCandidates} prefix="👤" valueStyle={{ color: '#fff' }} />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <Statistic title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Nhà tuyển dụng</span>} value={stats.totalEmployers} prefix="🏢" valueStyle={{ color: '#fff' }} />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                <Statistic title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Công việc</span>} value={stats.totalJobs} prefix="💼" valueStyle={{ color: '#fff' }} />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <Statistic title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Đơn ứng tuyển</span>} value={stats.totalApplications} prefix="📄" valueStyle={{ color: '#fff' }} />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' }}>
                <Statistic title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Chờ duyệt</span>} value={stats.pendingApplications} prefix="⏳" valueStyle={{ color: '#fff' }} />
              </Card>
            </Col>
          </>
        ) : null}
      </Row>

      {/* Tabs quản lý */}
      <Card>
        <Tabs items={tabItems} size="large" />
      </Card>

      {/* Modal chỉnh sửa */}
      <Modal
        title={editType === 'user' ? '✏️ Sửa người dùng' : '✏️ Sửa công việc'}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSubmit}
        confirmLoading={editLoading}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
      >
        {editType === 'user' && (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 500 }}>Họ tên</label>
              <Input value={editForm.fullName} onChange={(e) => setEditForm(p => ({ ...p, fullName: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 500 }}>Email</label>
              <Input value={editForm.email} onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontWeight: 500 }}>Vai trò</label>
                  <Select value={editForm.role} style={{ width: '100%' }} onChange={(v) => setEditForm(p => ({ ...p, role: v }))}>
                    <Option value="candidate">Ứng viên</Option>
                    <Option value="employer">Nhà tuyển dụng</Option>
                    <Option value="admin">Admin</Option>
                  </Select>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontWeight: 500 }}>SĐT</label>
                  <Input value={editForm.phone} onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </Col>
            </Row>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 500 }}>Công ty</label>
              <Input value={editForm.company} onChange={(e) => setEditForm(p => ({ ...p, company: e.target.value }))} />
            </div>
          </>
        )}

        {editType === 'job' && (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 500 }}>Tiêu đề</label>
              <Input value={editForm.title} onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontWeight: 500 }}>Công ty</label>
                  <Input value={editForm.company} onChange={(e) => setEditForm(p => ({ ...p, company: e.target.value }))} />
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontWeight: 500 }}>Thành phố</label>
                  <Input value={editForm.city} onChange={(e) => setEditForm(p => ({ ...p, city: e.target.value }))} />
                </div>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontWeight: 500 }}>Lương</label>
                  <Input value={editForm.salary} onChange={(e) => setEditForm(p => ({ ...p, salary: e.target.value }))} />
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontWeight: 500 }}>Ngành nghề</label>
                  <Input value={editForm.industry} onChange={(e) => setEditForm(p => ({ ...p, industry: e.target.value }))} />
                </div>
              </Col>
            </Row>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 500 }}>Trạng thái</label>
              <Select value={editForm.status} style={{ width: '100%' }} onChange={(v) => setEditForm(p => ({ ...p, status: v }))}>
                <Option value="active">Đang tuyển</Option>
                <Option value="closed">Đã đóng</Option>
              </Select>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};
