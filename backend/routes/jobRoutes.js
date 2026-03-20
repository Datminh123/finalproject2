import express from "express";
const router = express.Router();
import Jobs from '../models/Jobs.js'

// GET /api/jobs — Có phân trang + tìm kiếm/lọc
router.get("/", async (req, res) => {
  try {
    const { page, limit, keyword, city, industry, type, level } = req.query;

    // Nếu không có page/limit → trả về tất cả (tương thích cũ)
    if (!page && !limit) {
      const filter = {};
      if (keyword) {
        filter.$or = [
          { title: { $regex: keyword, $options: "i" } },
          { company: { $regex: keyword, $options: "i" } },
          { requirements: { $regex: keyword, $options: "i" } },
        ];
      }
      if (city) filter.city = city;
      if (industry) filter.industry = industry;
      if (type) filter.type = type;
      if (level) filter.level = level;

      const jobs = await Jobs.find(filter).sort({ postedDate: -1 });
      return res.json(jobs);
    }

    // Có phân trang
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const filter = {};

    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { company: { $regex: keyword, $options: "i" } },
        { requirements: { $regex: keyword, $options: "i" } },
      ];
    }
    if (city) filter.city = city;
    if (industry) filter.industry = industry;
    if (type) filter.type = type;
    if (level) filter.level = level;

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
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const jobs = new Jobs(req.body);
    await jobs.save();
    res.status(201).json(jobs);
  } catch (error) {
    res.status(400).json({ message: "Không thể tạo job mới", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const job = await Jobs.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Không tìm thấy công việc" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const job = await Jobs.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!job) return res.status(404).json({ message: "Không tìm thấy công việc" });
    res.json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Jobs.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa công việc" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/bulk", async (req, res) => {
  try {
    const jobsArray = req.body;
    if (!Array.isArray(jobsArray)) {
      return res.status(400).json({ message: "Dữ liệu phải là một mảng" });
    }
    const jobs = await Jobs.insertMany(jobsArray);
    res.status(201).json({ message: `Đã thêm ${jobs.length} job thành công`, jobs });
  } catch (error) {
    res.status(400).json({ message: "Không thể thêm nhiều job", error: error.message });
  }
});

export default router;