import Notification from "../models/Notification.js";




export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { targetUsers: req.user._id },
        { targetRoles: req.user.role }
      ]
    })
      .populate("relatedEvent", "title")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Failed to load notifications" });
  }
};



export const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      $addToSet: { isReadBy: req.user._id }
    });

    res.json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update notification" });
  }
};



