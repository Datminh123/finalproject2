import React, { useState } from 'react';
import { Card, Input, Button, Typography, Steps, message, Result } from 'antd';
import { MailOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { authAPI } from '../services/api';

const { Title, Text } = Typography;

export const ForgotPassword = ({ onBackToLogin }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Bước 1: Gửi OTP
  const handleSendOTP = async () => {
    if (!email) {
      setErrors({ email: 'Vui lòng nhập email!' });
      return;
    }
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      message.success('Đã gửi mã OTP đến email của bạn!');
      setCurrentStep(1);
      setErrors({});
    } catch (error) {
      const msg = error.response?.data?.message || 'Lỗi gửi OTP!';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác minh OTP + đặt mật khẩu mới
  const handleResetPassword = async () => {
    const newErrors = {};
    if (!otp) newErrors.otp = 'Vui lòng nhập mã OTP!';
    if (!newPassword) newErrors.newPassword = 'Vui lòng nhập mật khẩu mới!';
    if (newPassword.length < 6) newErrors.newPassword = 'Mật khẩu tối thiểu 6 ký tự!';
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp!';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword({ email, otp, newPassword });
      message.success('Đặt lại mật khẩu thành công!');
      setCurrentStep(2);
      setErrors({});
    } catch (error) {
      const msg = error.response?.data?.message || 'Lỗi đặt lại mật khẩu!';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const stepItems = [
    { title: 'Nhập Email', icon: <MailOutlined /> },
    { title: 'Xác minh OTP', icon: <SafetyOutlined /> },
    { title: 'Hoàn tất', icon: <LockOutlined /> },
  ];

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
          maxWidth: 460, 
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          borderRadius: '16px',
          border: 'none'
        }}
      >
        <Title level={2} style={{ textAlign: 'center', marginBottom: 8 }}>
          🔐 Quên mật khẩu
        </Title>
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
          Đặt lại mật khẩu qua mã OTP
        </Text>

        <Steps current={currentStep} items={stepItems} size="small" style={{ marginBottom: 32 }} />

        {/* Bước 1: Nhập Email */}
        {currentStep === 0 && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>Email đã đăng ký</div>
              <Input 
                prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="email@example.com"
                size="large"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                status={errors.email ? 'error' : ''}
                onPressEnter={handleSendOTP}
              />
              {errors.email && <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{errors.email}</div>}
            </div>
            <Button type="primary" onClick={handleSendOTP} block size="large" loading={loading}
              style={{ height: 48, borderRadius: 8, fontSize: 16 }}
            >
              📧 Gửi mã OTP
            </Button>
          </div>
        )}

        {/* Bước 2: Nhập OTP + Mật khẩu mới */}
        {currentStep === 1 && (
          <div>
            <div style={{ 
              background: 'linear-gradient(135deg, #e8f4fd 0%, #f0e6ff 100%)', 
              padding: '12px 16px', borderRadius: 8, marginBottom: 20, textAlign: 'center' 
            }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                📬 Mã OTP đã gửi đến <Text strong>{email}</Text>
              </Text>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>Mã OTP (6 chữ số)</div>
              <Input 
                prefix={<SafetyOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Nhập mã OTP"
                size="large"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                status={errors.otp ? 'error' : ''}
                style={{ letterSpacing: 8, textAlign: 'center', fontSize: 20, fontWeight: 'bold' }}
              />
              {errors.otp && <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{errors.otp}</div>}
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>Mật khẩu mới</div>
              <Input.Password 
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Tối thiểu 6 ký tự"
                size="large"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                status={errors.newPassword ? 'error' : ''}
              />
              {errors.newPassword && <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{errors.newPassword}</div>}
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>Xác nhận mật khẩu</div>
              <Input.Password 
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Nhập lại mật khẩu mới"
                size="large"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                status={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{errors.confirmPassword}</div>}
            </div>

            <Button type="primary" onClick={handleResetPassword} block size="large" loading={loading}
              style={{ height: 48, borderRadius: 8, fontSize: 16, marginBottom: 12 }}
            >
              🔑 Đặt lại mật khẩu
            </Button>
            <Button type="link" onClick={() => { setCurrentStep(0); setOtp(''); }} block>
              ← Gửi lại mã OTP
            </Button>
          </div>
        )}

        {/* Bước 3: Hoàn tất */}
        {currentStep === 2 && (
          <Result
            status="success"
            title="Đặt lại mật khẩu thành công! 🎉"
            subTitle="Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ."
            extra={
              <Button type="primary" size="large" onClick={onBackToLogin}
                style={{ height: 48, borderRadius: 8, paddingInline: 40 }}
              >
                🔙 Quay lại đăng nhập
              </Button>
            }
          />
        )}

        {currentStep !== 2 && (
          <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 16 }}>
            <a href="#" onClick={(e) => { e.preventDefault(); onBackToLogin(); }}>← Quay lại đăng nhập</a>
          </Text>
        )}
      </Card>
    </div>
  );
};
