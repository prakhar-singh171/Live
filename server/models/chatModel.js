const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  room: String,
  username: String,
  text: String,
  timestamp: String,
});

module.exports = mongoose.model("Chat", chatSchema);
