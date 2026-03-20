import mongoose from "mongoose";

const ApplicationsSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job"
  },
  candidateName: String,
  candidateEmail: String,
  resume: String,
  coverLetter: String,
  status: {
    type: String,
    default: "pending"
  },
  appliedDate: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Applications", ApplicationsSchema);