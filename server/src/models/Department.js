import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shortCode: { type: String, required: true }, // CSE, AIML
  description: { type: String },
  activityScopes: [{ type: String }]
}, { timestamps: true });

export default mongoose.model("Department", departmentSchema);
