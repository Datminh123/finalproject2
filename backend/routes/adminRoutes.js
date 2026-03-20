import express from "express";
import Account from "../models/Account.js";
import Jobs from "../models/Jobs.js";
import Applications from "../models/Applications.js";

const router = express.Router();

// Middleware kiểm tra quyền admin
const isAdmin = async (req, res, next) => {
  const { adminEmail } = req.headers;
  if (!adminEmail) {
    return res.status(403).json({ message: "Không có quyền truy cập!" });
  }
  const account = await Account.findOne({ email: adminEmail });
  if (!account || account.role !== "admin") {
    return res.status(403).json({ message: "Bạn không phải admin!" });
  }
  next();
};

// ============ THỐNG KÊ ============
// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await Account.countDocuments();
    const totalJobs = await Jobs.countDocuments();
    const totalApplications = await Applications.countDocuments();
    const totalCandidates = await Account.countDocuments({ role: "candidate" });
    const totalEmployers = await Account.countDocuments({ role: "employer" });
    const pendingApplications = await Applications.countDocuments({ status: "pending" });

    res.json({
      totalUsers,
      totalJobs,
      totalApplications,
      totalCandidates,
      totalEmployers,
      pendingApplications,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy thống kê", error: error.message });
  }
});

// ============ QUẢN LÝ NGƯỜI DÙNG ============
// GET /api/admin/users — Phân trang + tìm kiếm
router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword = "", role = "" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const filter = {};
    if (keyword) {
      filter.$or = [
        { fullName: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
      ];
    }
    if (role) {
      filter.role = role;
    }

    const total = await Account.countDocuments(filter);
    const users = await Account.find(filter)
      .select("-password -resetOTP -resetOTPExpires")
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    res.json({
      data: users,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách người dùng", error: error.message });
  }
});

// PUT /api/admin/users/:id — Sửa người dùng
router.put("/users/:id", async (req, res) => {
  try {
    const { fullName, email, role, phone, company } = req.body;
    const account = await Account.findByIdAndUpdate(
      req.params.id,
      { fullName, email, role, phone, company },
      { returnDocument: 'after'}
    ).select("-password");

    if (!account) {
      return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    }
    res.json(account);
  } catch (error) {
    res.status(400).json({ message: "Lỗi cập nhật", error: error.message });
  }
});

// DELETE /api/admin/users/:id — Xóa người dùng
router.delete("/users/:id", async (req, res) => {
  try {
    await Account.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa người dùng!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa", error: error.message });
  }
});

// ============ QUẢN LÝ CÔNG VIỆC ============
// GET /api/admin/jobs — Phân trang + tìm kiếm
router.get("/jobs", async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword = "", city = "", industry = "" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const filter = {};
    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { company: { $regex: keyword, $options: "i" } },
      ];
    }
    if (city) filter.city = city;
    if (industry) filter.industry = industry;

    const total = await Jobs.countDocuments(filter);
    const jobs = await Jobs.find(filter)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ postedDate: -1 });

    res.json({
      data: jobs,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách công việc", error: error.message });
  }
});

// PUT /api/admin/jobs/:id — Sửa công việc
router.put("/jobs/:id", async (req, res) => {
  try {
    const job = await Jobs.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!job) return res.status(404).json({ message: "Không tìm thấy công việc!" });
    res.json(job);
  } catch (error) {
    res.status(400).json({ message: "Lỗi cập nhật", error: error.message });
  }
});

// DELETE /api/admin/jobs/:id — Xóa công việc
router.delete("/jobs/:id", async (req, res) => {
  try {
    await Jobs.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa công việc!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa", error: error.message });
  }
});

// ============ QUẢN LÝ ĐƠN ỨNG TUYỂN ============
// GET /api/admin/applications — Phân trang
router.get("/applications", async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "", keyword = "" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const filter = {};
    if (status) filter.status = status;
    if (keyword) {
      filter.$or = [
        { candidateName: { $regex: keyword, $options: "i" } },
        { candidateEmail: { $regex: keyword, $options: "i" } },
      ];
    }

    const total = await Applications.countDocuments(filter);
    const applications = await Applications.find(filter)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ appliedDate: -1 });

    res.json({
      data: applications,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách đơn ứng tuyển", error: error.message });
  }
});

// DELETE /api/admin/applications/:id
router.delete("/applications/:id", async (req, res) => {
  try {
    await Applications.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa đơn ứng tuyển!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa", error: error.message });
  }
});

export default router;
