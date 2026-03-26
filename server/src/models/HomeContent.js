import mongoose from "mongoose";

const departmentScopeSchema = new mongoose.Schema({
  department: { type: String, required: true },
  description: { type: String, required: true },
});

const homeContentSchema = new mongoose.Schema(
  {
    heroTitle: { type: String, default: "Welcome to Actify" },
    heroSubtitle: { type: String, default: "Academic Activity Report Management System" },

    aboutAtria: { type: String },

    departmentScopes: [departmentScopeSchema],

    stats: {
      reports: { type: Number, default: 0 },
      faculty: { type: Number, default: 0 },
      departments: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model("HomeContent", homeContentSchema);
