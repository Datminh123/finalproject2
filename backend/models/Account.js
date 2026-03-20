import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["candidate", "employer", "admin"] },
  phone: { type: String, default: "" },
  company: { type: String, default: "" },
  avatar: { type: String, default: "" },
  resetOTP: { type: String, default: "" },
  resetOTPExpires: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Account", AccountSchema);
