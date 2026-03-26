


// server/src/controllers/adminEventController.js
import Event from "../models/Event.js";

export const getAllEventsForAdmin = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
};
