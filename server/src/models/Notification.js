

//server/src/models/Notification.js

import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },

    type: {
      type: String,
      enum: ["EVENT_CREATED", "EVENT_UPDATED", "EVENT_DELETED"],
      required: true
    },

    targetRoles: {
      type: [String], // ["admin", "hod", "principal"]
      required: true
    },

    relatedEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    isReadBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
