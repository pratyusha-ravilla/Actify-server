
// server/src/models/Activity.js
import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {

    reportType: {
      type: String,
      enum: ["conducted", "attended", "expert_talk"],
      required: true,
    },

    academicYear: { type: String, required: true },

    activityName: String,
    coordinator: String,
    date: String,
    duration: String,
    poPos: String,

    // File paths
    invitation: String,
    poster: String,

    resourcePerson: {
      name: String,
      designation: String,
      institution: String,
      photo: String,
    },

    // Expanded sessionReport schema - added the new fields you use
    sessionReport: {
      sessionName: { type: String, default: "" },
      coordinators: { type: [String], default: [] }, // stored as array
      date: { type: String, default: "" }, // session-specific date if any
      googleMeetLink: { type: String, default: "" },
      intendedParticipants: { type: String, default: "" },
      categoryOfEvent: { type: String, default: "" },

      // existing fields
      summary: { type: String, default: "" },
      participantsCount: { type: Number, default: 0 },
      facultyCount: { type: Number, default: 0 },
    },

     attendanceImages: {
    type: [String],
    default: []
  },
    photos: [String],

    feedbackImages: [String],

    // 🔥 Admin Approval Workflow
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: null },

    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    rejectedAt: { type: Date, default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);
