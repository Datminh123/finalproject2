import express from "express";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import Account from "../models/Account.js";
import { env } from "../config/environtment.js";
const router = express.Router();

// Cấu hình nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
    
  },
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, role, phone, company } = req.body;

    const existingUser = await Account.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const account = new Account({
      fullName, email, password: hashedPassword, role,
      phone: phone || "", company: company || ""
    });

    await account.save();
    const userResponse = account.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: "Lỗi đăng ký", error: error.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const account = await Account.findOne({ email });
    if (!account) {
      return res.status(401).json({ message: "Email không tồn tại!" });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu không đúng!" });
    }

    if (role && account.role !== role) {
      return res.status(401).json({ message: "Vai trò không đúng! Tài khoản này là " + account.role });
    }

    const userResponse = account.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: "Lỗi đăng nhập", error: error.message });
  }
});

// PUT /api/auth/profile
router.put("/profile", async (req, res) => {
  try {
    const { email, fullName, phone, company, avatar } = req.body;

    const account = await Account.findOneAndUpdate(
      { email },
      { fullName, phone, company, avatar },
      { returnDocument: 'after' }
    );

    if (!account) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản!" });
    }

    const userResponse = account.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật", error: error.message });
  }
});

// PUT /api/auth/change-password
router.put("/change-password", async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    const account = await Account.findOne({ email });
    if (!account) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản!" });
    }

    const isMatch = await bcrypt.compare(oldPassword, account.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu cũ không đúng!" });
    }

    const salt = await bcrypt.genSalt(10);
    account.password = await bcrypt.hash(newPassword, salt);
    await account.save();

    res.json({ message: "Đổi mật khẩu thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi đổi mật khẩu", error: error.message });
  }
});

// POST /api/auth/forgot-password — Gửi mã OTP qua email
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const account = await Account.findOne({ email });
    if (!account) {
      return res.status(404).json({ message: "Email không tồn tại trong hệ thống!" });
    }

    // EMAIL_USER=minhdat2727@gmail.com
// EMAIL_PASS=tibn fwkv csnf yxgl
    const sendEmail = 'minhdat2727@gmail.com'
    console.log('sendEmail',sendEmail)
    // Tạo mã OTP 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Lưu OTP vào database (hết hạn sau 10 phút)
    account.resetOTP = otp;
    account.resetOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
    await account.save();

    // Gửi email
    const mailOptions = {
      from: `"Job Portal" <${sendEmail}>`,
      to: email,
      subject: "🔐 Mã OTP đặt lại mật khẩu - Job Portal",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px;">
          <div style="background: white; border-radius: 8px; padding: 30px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 10px;">💼 Job Portal</h2>
            <p style="color: #666;">Bạn đã yêu cầu đặt lại mật khẩu.</p>
            <div style="background: #f0f2f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="color: #999; margin: 0 0 10px 0; font-size: 14px;">Mã OTP của bạn:</p>
              <h1 style="color: #1890ff; letter-spacing: 8px; margin: 0; font-size: 36px;">${otp}</h1>
            </div>
            <p style="color: #ff4d4f; font-size: 13px;">⏰ Mã có hiệu lực trong 10 phút</p>
            <p style="color: #999; font-size: 12px;">Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Đã gửi mã OTP đến email của bạn!" });
  } catch (error) {
    console.error("Lỗi gửi email:", error);
    res.status(500).json({ message: "Lỗi gửi email! Vui lòng thử lại sau.", error: error.message });
  }
});

// POST /api/auth/reset-password — Xác minh OTP và đặt lại mật khẩu
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const account = await Account.findOne({ email });
    if (!account) {
      return res.status(404).json({ message: "Email không tồn tại!" });
    }

    if (!account.resetOTP || account.resetOTP !== otp) {
      return res.status(400).json({ message: "Mã OTP không đúng!" });
    }

    if (!account.resetOTPExpires || account.resetOTPExpires < new Date()) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn! Vui lòng yêu cầu mã mới." });
    }

    const salt = await bcrypt.genSalt(10);
    account.password = await bcrypt.hash(newPassword, salt);
    account.resetOTP = "";
    account.resetOTPExpires = null;
    await account.save();

    res.json({ message: "Đặt lại mật khẩu thành công! Vui lòng đăng nhập." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi đặt lại mật khẩu", error: error.message });
  }
});

export default router;
