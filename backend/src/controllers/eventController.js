const Event = require("../models/eventModel");

// Get events by role
const getEventsByRole = async (req, res) => {
  try {
    const { role } = req.query;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    const events = await Event.find({
      role,
      isActive: true,
    }).sort({ date: 1 });

    return res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Get Events Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message,
    });
  }
};

const createEvent = async (req, res) => {
  try {
    const {
      title,
      type,
      date,
      startTime,
      endTime,
      location,
      description,
      organizer,
      role,
    } = req.body;

    if (!title || !type || !date || !location || !role) {
      return res.status(400).json({
        success: false,
        message: "Title, type, date, location and role are required",
      });
    }

    const event = await Event.create({
      title,
      type,
      date,
      startTime,
      endTime,
      location,
      description,
      organizer,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error("Create Event Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create event",
      error: error.message,
    });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
      event,
    });
  } catch (error) {
    console.error("Delete Event Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete event",
      error: error.message,
    });
  }
};

module.exports = {
  getEventsByRole,
  createEvent,
  deleteEvent,
};
