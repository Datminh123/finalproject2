import React, { useState } from 'react';
import { Card, Input, Select, Button, Typography, Modal, message } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

export const RegisterForm = ({ onRegister, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    phone: '',
    company: '' // Chỉ hiển thị nếu role là employer
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Xóa lỗi khi user bắt đầu nhập
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName) {
      newErrors.fullName = 'Vui lòng nhập họ tên!';
    }
    
    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email!';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ!';
    }
    
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu!';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự!';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu!';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp!';
    }
    
    if (!formData.role) {
      newErrors.role = 'Vui lòng chọn vai trò!';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Vui lòng nhập số điện thoại!';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ!';
    }
    
    if (formData.role === 'employer' && !formData.company) {
      newErrors.company = 'Vui lòng nhập tên công ty!';
    }
    
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Gọi API đăng ký thực tế
      await onRegister({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        company: formData.company
      });
      
      // Hiển thị thông báo thành công
      Modal.success({
        title: 'Đăng ký thành công!',
        content: 'Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.',
        onOk: onBackToLogin
      });
    } catch (error) {
      const msg = error.response?.data?.message || 'Đăng ký thất bại!';
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
          width: 500, 
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          borderRadius: '10px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <Title level={2} style={{ textAlign: 'center', marginBottom: 30 }}>
          💼 Đăng ký tài khoản
        </Title>
        
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>Họ và tên *</div>
          <Input 
            placeholder="Nguyễn Văn A"
            value={formData.fullName}
            onChange={(e) => updateFormData('fullName', e.target.value)}
            status={errors.fullName ? 'error' : ''}
          />
          {errors.fullName && (
            <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
              {errors.fullName}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>Email *</div>
          <Input 
            placeholder="email@example.com"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            status={errors.email ? 'error' : ''}
          />
          {errors.email && (
            <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
              {errors.email}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>Số điện thoại *</div>
          <Input 
            placeholder="0123456789"
            value={formData.phone}
            onChange={(e) => updateFormData('phone', e.target.value)}
            status={errors.phone ? 'error' : ''}
          />
          {errors.phone && (
            <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
              {errors.phone}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>Vai trò *</div>
          <Select 
            placeholder="Chọn vai trò"
            style={{ width: '100%' }}
            value={formData.role || undefined}
            onChange={(value) => updateFormData('role', value)}
            status={errors.role ? 'error' : ''}
          >
            <Option value="candidate">👤 Ứng viên</Option>
            <Option value="employer">🏢 Nhà tuyển dụng</Option>
            <Option value="admin">🛡️ Quản trị viên</Option>
          </Select>
          {errors.role && (
            <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
              {errors.role}
            </div>
          )}
        </div>

        {formData.role === 'employer' && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8 }}>Tên công ty *</div>
            <Input 
              placeholder="Công ty ABC"
              value={formData.company}
              onChange={(e) => updateFormData('company', e.target.value)}
              status={errors.company ? 'error' : ''}
            />
            {errors.company && (
              <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                {errors.company}
              </div>
            )}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>Mật khẩu *</div>
          <Input.Password 
            placeholder="Tối thiểu 6 ký tự"
            value={formData.password}
            onChange={(e) => updateFormData('password', e.target.value)}
            status={errors.password ? 'error' : ''}
          />
          {errors.password && (
            <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
              {errors.password}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 8 }}>Xác nhận mật khẩu *</div>
          <Input.Password 
            placeholder="Nhập lại mật khẩu"
            value={formData.confirmPassword}
            onChange={(e) => updateFormData('confirmPassword', e.target.value)}
            status={errors.confirmPassword ? 'error' : ''}
          />
          {errors.confirmPassword && (
            <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
              {errors.confirmPassword}
            </div>
          )}
        </div>

        <Button 
          type="primary" 
          onClick={handleSubmit} 
          block 
          size="large"
          style={{ marginBottom: 16 }}
          loading={loading}
        >
          Đăng ký
        </Button>

        <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
          Đã có tài khoản? <a href="#" onClick={onBackToLogin}>Đăng nhập ngay</a>
        </Text>
      </Card>
    </div>
  );
};