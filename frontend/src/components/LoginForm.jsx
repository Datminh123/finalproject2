import React, { useState } from 'react';
import { Card, Input, Select, Button, Typography, message } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

export const LoginForm = ({ onLogin, onShowRegister, onShowForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Vui lòng nhập email!';
    if (!password) newErrors.password = 'Vui lòng nhập mật khẩu!';
    if (!role) newErrors.role = 'Vui lòng chọn vai trò!';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await onLogin({ email, password, role });
    } catch (error) {
      const msg = error.response?.data?.message || 'Đăng nhập thất bại!';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%',
          maxWidth: 400, 
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          borderRadius: '16px',
          border: 'none'
        }}
      >
        <Title level={2} style={{ textAlign: 'center', marginBottom: 30 }}>
          💼 Job Portal
        </Title>
        
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>Email</div>
          <Input 
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            status={errors.email ? 'error' : ''}
            size="large"
          />
          {errors.email && <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{errors.email}</div>}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>Mật khẩu</div>
          <Input.Password 
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            status={errors.password ? 'error' : ''}
            size="large"
          />
          {errors.password && <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{errors.password}</div>}
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 8 }}>Đăng nhập với vai trò</div>
          <Select 
            placeholder="Chọn vai trò"
            style={{ width: '100%' }}
            value={role || undefined}
            onChange={(value) => setRole(value)}
            status={errors.role ? 'error' : ''}
            size="large"
          >
            <Option value="candidate">👤 Ứng viên</Option>
            <Option value="employer">🏢 Nhà tuyển dụng</Option>
            <Option value="admin">🛡️ Quản trị viên</Option>
          </Select>
          {errors.role && <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{errors.role}</div>}
        </div>

        <Button type="primary" onClick={handleSubmit} block size="large" loading={loading}
          style={{ height: 48, borderRadius: 8, fontSize: 16, marginBottom: 12 }}
        >
          Đăng nhập
        </Button>

        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onShowForgotPassword?.(); }}
            style={{ color: '#ff4d4f', fontSize: 13 }}
          >
            🔐 Quên mật khẩu?
          </a>
        </div>

        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 12 }}>
          Chưa có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); onShowRegister(); }}>Đăng ký ngay</a>
        </Text>
      </Card>
    </div>
  );
};