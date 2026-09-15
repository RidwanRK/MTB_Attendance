import mongoose, { Schema } from "mongoose";

const profileSchema = new Schema(
  {
    name: { type: String, default: "Marzia Hossain" },
    studentId: { type: String, default: "2022-2-10-259" },
    role: { type: String, default: "Intern" },
    institution: { type: String, default: "East West University" },
    unit: { type: String, default: "Process Re-engineering and Optimization Unit" },
    division: { type: String, default: "Digital Banking Division" },
  },
  { timestamps: true }
);

export default mongoose.models.Profile || mongoose.model("Profile", profileSchema);
