import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Space, Typography, Drawer, Badge, Popover, List, notification, message } from 'antd';
import { MenuOutlined,BellOutlined } from '@ant-design/icons';
import { io } from "socket.io-client";
import { AuthProvider, useAuth } from './context/AuthContext';
import { JobsProvider } from './context/JobsContext';
import { ApplicationsProvider } from './context/ApplicationsContext';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { ForgotPassword } from './components/ForgotPassword';
import { CandidateDashboard } from './components/CandidateDashboard';
import { EmployerDashboard } from './components/EmployerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ApplicationManager } from './components/ApplicationManager';
import { JobSearchPage } from './components/JobSearchPage';
import { CVLibrary } from './components/CVLibrary';
import { Profile } from './components/Profile';
import { ChangePassword } from './components/ChangePassword';
import { PostJob } from './components/PostJob';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

// Component nội dung chính tách riêng để dùng được useAuth()
const MainLayout = () => {
  const { user, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState('1');
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  // Responsive: phát hiện mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  useEffect(() => {
    const fetchNotis = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/notifications/${user.email}`);
        const data = await response.json();
        setNotifications(data);
      } catch (err) { console.error("Lỗi fetch noti:", err); }
    };
    if (user?.email) fetchNotis();
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      const newSocket = io("http://localhost:5000");
      setSocket(newSocket);
      newSocket.emit("registerUser", user.email);
      return () => newSocket.close();
    }
  }, [user?.email]);

  useEffect(() => {
    if (socket) {
      socket.on("getNotification", (data) => {
        setNotifications((prev) => [data, ...prev]);
        notification.success({
          message: data.title,
          description: data.message,
          placement: 'topRight',
        });
      });
    }
  }, [socket]);

  const handleMarkAllAsRead = async () => {
    if (!user?.email) return;
    try {
      const response = await fetch(`http://localhost:5000/api/applications/mark-all-read/${user.email}`, {
        method: 'PUT'
      });

      if (response.ok) {
        setNotifications(prev => prev.map(noti => ({
          ...noti,
          isRead: true
        })));
        message.success("Đã đọc tất cả thông báo");
      }
    } catch (err) {
      console.error("Lỗi:", err);
    }
  };

  const notificationContent = (
    <div style={{ width: 300 }}>
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 1
      }}>
        <Text strong>Thông báo</Text>
        <Button
          type="link"
          size="small"
          onClick={handleMarkAllAsRead}
          disabled={!notifications.some(n => !n.isRead)}
          style={{ padding: 0 }}
        >
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      <List
        size="small"
        dataSource={notifications}
        locale={{ emptyText: 'Không có thông báo' }}
        style={{ maxHeight: 350, overflowY: 'auto' }}
        renderItem={(item) => (
          <List.Item style={{
            cursor: 'pointer',
            background: item.isRead ? '#fff' : '#f0f5ff',
            padding: '12px',
            borderBottom: '1px solid #f5f5f5'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Text strong style={{ fontSize: '13px', color: item.isRead ? '#595959' : '#1890ff' }}>
                {item.title}
              </Text>
              <Text style={{ fontSize: '12px' }}>{item.message}</Text>
            </div>
          </List.Item>
        )}
      />
    </div>
  );

  // 1. Phân quyền Menu Items
  const menuItems = {
    candidate: [
      { key: '1', label: '📊 Dashboard' },
      { key: 'search', label: '🔍 Tìm việc làm' },
      { key: 'cv_lib', label: '📄 Thư viện CV' },
      { key: '2', label: '📤 Đơn ứng tuyển' },
      { key: 'profile', label: '👤 Trang cá nhân' },
      { key: 'change_password', label: '🔒 Đổi mật khẩu' },
    ],
    employer: [
      { key: '1', label: '📈 Dashboard Tuyển dụng' },
      { key: 'post_job', label: '📝 Đăng tin' },
      { key: 'profile', label: '🏢 Hồ sơ công ty' },
      { key: 'change_password', label: '🔒 Đổi mật khẩu' },
    ],
    admin: [
      { key: '1', label: '🛡️ Dashboard Admin' },
      { key: 'profile', label: '👤 Trang cá nhân' },
      { key: 'change_password', label: '🔒 Đổi mật khẩu' },
    ]
  };

  // 2. Phân quyền Content dựa trên Role và Menu Key
  const renderMainContent = () => {
    if (user.role === 'candidate') {
      switch (activeMenu) {
        case '1': return <CandidateDashboard />;
        case 'search': return <JobSearchPage />;
        case 'cv_lib': return <CVLibrary />;
        case '2': return <ApplicationManager />;
        case 'profile': return <Profile />;
        case 'change_password': return <ChangePassword />;
        default: return <CandidateDashboard />;
      }
    }
    if (user.role === 'employer') {
      switch (activeMenu) {
        case '1': return <EmployerDashboard />;
        case 'post_job': return <PostJob />;
        case 'profile': return <Profile />;
        case 'change_password': return <ChangePassword />;
        default: return <EmployerDashboard />;
      }
    }
    if (user.role === 'admin') {
      switch (activeMenu) {
        case '1': return <AdminDashboard />;
        case 'profile': return <Profile />;
        case 'change_password': return <ChangePassword />;
        default: return <AdminDashboard />;
      }
    }
    return <div>Không có quyền truy cập</div>;
  };

  const handleMenuClick = ({ key }) => {
    setActiveMenu(key);
    if (isMobile) setDrawerVisible(false);
  };

  const roleLabels = { candidate: 'ỨNG VIÊN', employer: 'NHÀ TUYỂN DỤNG', admin: 'QUẢN TRỊ VIÊN' };

  const menuContent = (
    <Menu
      theme="dark"
      selectedKeys={[activeMenu]}
      mode="inline"
      items={menuItems[user.role] || []}
      onClick={handleMenuClick}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar Desktop */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          breakpoint="lg"
          style={{ position: 'sticky', top: 0, height: '100vh', zIndex: 10 }}
        >
          <div style={{ height: 64, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: collapsed ? 20 : 16 }}>
            {collapsed ? '💼' : 'JOB PORTAL'}
          </div>
          {menuContent}
        </Sider>
      )}

      {/* Drawer Mobile */}
      {isMobile && (
        <Drawer
          title={<span style={{ color: '#fff' }}>💼 JOB PORTAL</span>}
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={260}
          styles={{
            header: { background: '#001529', borderBottom: '1px solid #1a3a5c' },
            body: { padding: 0, background: '#001529' },
          }}
        >
          {menuContent}
        </Drawer>
      )}

      <Layout>
        <Header style={{
          background: '#fff', padding: '0 16px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          position: 'sticky', top: 0, zIndex: 9
        }}>
          <Space>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerVisible(true)}
                style={{ fontSize: 18 }}
              />
            )}
            <Title level={4} style={{ margin: 0, fontSize: isMobile ? 14 : 18 }}>
              HỆ THỐNG {roleLabels[user.role] || user.role?.toUpperCase()}
            </Title>
          </Space>

          <Space size={isMobile ? 'small' : 'large'}>
            <Popover content={notificationContent} title="Thông báo mới" trigger="click" placement="bottomRight">
              <Badge count={notifications.filter(n => n.isRead === false).length} offset={[10, 0]}>
                <Button type="text" icon={<BellOutlined style={{ fontSize: '20px' }} />} />
              </Badge>
            </Popover>
            <Space>
<Avatar
  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.fullName}`}
>
  {user?.fullName?.charAt(0).toUpperCase()}
</Avatar>
              {!isMobile && <Text strong>{user.fullName}</Text>}
            </Space>
            <Button type="primary" danger onClick={logout} size={isMobile ? 'small' : 'middle'}>
              Đăng xuất
            </Button>
          </Space>
        </Header>

        <Content style={{ margin: isMobile ? '12px 8px' : '24px' }}>
          <div style={{ padding: isMobile ? 12 : 24, minHeight: 360, background: '#fff', borderRadius: '12px' }}>
            {renderMainContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

// Component bao ngoài cùng
const AuthWrapper = () => {
  const { user, login, register } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (!user) {
    if (showForgotPassword) {
      return <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />;
    }
    return showRegister ? (
      <RegisterForm onRegister={register} onBackToLogin={() => setShowRegister(false)} />
    ) : (
      <LoginForm
        onLogin={login}
        onShowRegister={() => setShowRegister(true)}
        onShowForgotPassword={() => setShowForgotPassword(true)}
      />
    );
  }

  return <MainLayout />;
};

function App() {
  return (
    <AuthProvider>
      <JobsProvider>
        <ApplicationsProvider>
          <AuthWrapper />
        </ApplicationsProvider>
      </JobsProvider>
    </AuthProvider>
  );
}

export default App;