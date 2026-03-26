

//server//src/models/Events.js

import mongoose from "mongoose";

/* ================= REGISTRATION SUB-SCHEMA ================= */
const registrationSchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    registeredAt: {
      type: Date,
      default: Date.now,
    },

    attendanceMarked: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

/* ================= EVENT SCHEMA ================= */
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    department: {
      type: String,
      required: true,
    },

    eventType: {
      type: String,
      enum: ["expert talk", "conducted", "attended", "others"],
      required: true,
      lowercase:true
    },

    // Only used when eventType = "others"
    customEventType: {
      type: String,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    registrations: [registrationSchema],

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);