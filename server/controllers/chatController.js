const Chat = require("../models/chatModel");

// Fetch chat history for a room
const getChatHistory = async (req, res) => {
  try {
    const { room } = req.params;
    const chatHistory = await Chat.find({ room }).sort({ _id: 1 });
    res.json(chatHistory);
  } catch (error) {
    res.status(500).json({ error: "Error fetching chat history" });
  }
};

// Save a new message
const saveMessage = async (req, res) => {
  try {
    const { room, username, text } = req.body;
    const timestamp = new Date().toLocaleTimeString();

    const newMessage = new Chat({ room, username, text, timestamp });
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Error saving message" });
  }
};

module.exports = { getChatHistory, saveMessage };
