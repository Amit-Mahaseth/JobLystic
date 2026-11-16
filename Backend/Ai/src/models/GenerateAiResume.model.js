import mongoose from "mongoose";

const GenerateAiResumeSchema = new mongoose.Schema(
  {
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewReport",
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    data: {
      type: Buffer,
      required: true,
    },
    fileName: {
      type: String,
      default: "Amit-Kumar-Resume.pdf",
    },
    contentType: {
      type: String,
      default: "application/pdf",
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const GenerateAiResumeModel = mongoose.model("GenerateAiResume", GenerateAiResumeSchema);

export default GenerateAiResumeModel;