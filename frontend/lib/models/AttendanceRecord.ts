import mongoose, { Schema } from "mongoose";

const attendanceRecordSchema = new Schema(
  {
    date: { type: String, required: true, unique: true }, // YYYY-MM-DD
    day: { type: String, required: true },
    checkIn: { type: String, default: null },
    checkOut: { type: String, default: null },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late"],
      default: "Present",
    },
    late: { type: String, enum: ["Yes", "No"], default: "No" },
    remarks: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.AttendanceRecord ||
  mongoose.model("AttendanceRecord", attendanceRecordSchema);
