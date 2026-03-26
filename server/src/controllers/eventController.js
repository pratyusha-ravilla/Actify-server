
//server/src/controllers/eventController.js

import Event from "../models/Event.js";

import Notification from "../models/Notification.js";


//email notification
import { sendEmail } from "../utils/emailService.js";

/**
 * GET /api/events/open
 * List all open events for faculty registration
 */

export const getOpenEvents = async (req, res) => {
  try {
    const events = await Event.find({
      status: "open",
      $or: [
        { approvalStatus: "approved" }, // visible to all
        { createdBy: req.user._id }, // visible to creator
      ],
    })
      .populate("createdBy", "_id name")
      .sort({ startDate: 1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

export const createEvent = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      title,
      description,
      department,
      eventType,
      customEventType,
      startDate,
      endDate,
    } = req.body;
    // 🔐 If Others selected, require custom event type
    if (eventType === "others" && !customEventType) {
      return res.status(400).json({
        message: "Please specify the event type",
      });
    }
    const event = await Event.create({
      title,
      description,
      department,
      eventType,
      customEventType: eventType === "others" ? customEventType : null,
      startDate,
      endDate,
      createdBy: req.user._id,
    });

    const displayType = eventType === "others" ? customEventType : eventType;

    // 🔔 CREATE NOTIFICATION
    await Notification.create({
      title: "New Event Created",
      message: `${req.user.name} created a new ${displayType} event: "${title}"`,
      type: "EVENT_CREATED",
      targetRoles: ["admin", "hod", "principal"],
      relatedEvent: event._id,
      createdBy: req.user._id,
    });

    res.status(201).json(event);
  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/events/:id/register
 * Faculty registers for an event
 */


export const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Ensure registrations array exists
    if (!event.registrations) {
      event.registrations = [];
    }

    const alreadyRegistered = event.registrations.some(
      (r) => String(r.faculty) === String(req.user._id)
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: "Already registered" });
    }

    event.registrations.push({
      faculty: req.user._id,
    });

    await event.save();


    console.log("Sending email to:", req.user.email);
     // ✅ SEND EMAIL HERE
    
    const html = `
<div style="font-family: Arial; padding:20px">

  <h2 style="color:#4c1d95;">Actify Event Registration</h2>

  <p>Dear ${req.user.name},</p>

  <p>You have successfully registered for the following event:</p>

  <table style="border-collapse: collapse;">
    <tr>
      <td><b>Event:</b></td>
      <td>${event.title}</td>
    </tr>
    <tr>
      <td><b>Department:</b></td>
      <td>${event.department}</td>
    </tr>
    <tr>
      <td><b>Date:</b></td>
      <td>${new Date(event.startDate).toDateString()}</td>
    </tr>
  </table>

  <p style="margin-top:15px">
  Please attend the event and remember to submit your report after completion.
  </p>

  <hr/>

  <p style="color:#7c3aed;font-weight:bold">
  Actify System
  </p>

</div>
`;

await sendEmail(
  req.user.email,
  "Actify: Event Registration Confirmed",
  html
);
  
    res.json({ message: "Registered successfully" });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};


/**
 * GET /api/events/my-registrations
 * Faculty registered events
 */
export const myRegistrations = async (req, res) => {
  try {
    const events = await Event.find({
      "registrations.faculty": req.user._id,
    }).sort({ startDate: 1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to load registrations" });
  }
};

//delete event


export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // ✅ Check ownership
    if (String(event.createdBy) !== String(req.user._id)) {
      return res.status(403).json({
        message: "You are not allowed to delete this event",
      });
    }

    await event.deleteOne();

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.log("DELETE EVENT ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

export const approveEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });

  event.approvalStatus = "approved";
  event.approvedBy = req.user._id;
  event.approvedAt = new Date();
  await event.save();

  res.json({ message: "Event approved" });
};

export const rejectEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });

  event.approvalStatus = "rejected";
  event.approvedBy = req.user._id;
  event.approvedAt = new Date();
  await event.save();

  res.json({ message: "Event rejected" });
};

export const getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "registrations.faculty",
      "name email department",
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({
      title: event.title,
      eventType: event.eventType,
      registrations: event.registrations,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch registrations" });
  }
};

// new update server/src/controllers/eventController.js
export const myCreatedEvents = async (req, res) => {
  try {
    const events = await Event.find({
      createdBy: req.user._id,
    })
      .populate("createdBy", "_id name")
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch created events" });
  }
};

// new update to auto fill the contents while creating report
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "createdBy",
      "name email",
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("GET EVENT ERROR:", error);
    res.status(500).json({ message: "Failed to fetch event" });
  }
};
