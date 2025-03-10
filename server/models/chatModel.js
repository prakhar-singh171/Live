// /models/chatModel.js
const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  room: { type: String, required: true },
  username: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: String, required: true },
  seenBy: { type: [String], default: [] }  // NEW: List of usernames who have seen the message
}, { timestamps: true });

module.exports = mongoose.model("Chat", chatSchema);
