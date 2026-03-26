

//server/src/models/EventRegistration.js

import mongoose from "mongoose";

const eventRegistrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },

    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["registered", "approved", "rejected"],
      default: "registered"
    }
  },
  { timestamps: true }
);

// Prevent duplicate registrations
eventRegistrationSchema.index({ event: 1, faculty: 1 }, { unique: true });

export default mongoose.model("EventRegistration", eventRegistrationSchema);
