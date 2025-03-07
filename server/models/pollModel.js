const mongoose = require("mongoose");

const pollOptionSchema = new mongoose.Schema({
  option: { type: String, required: true },
  votes: { type: Number, default: 0 },
  votedBy: { type: [String], default: [] } // New field: list of usernames who have voted for this option
});

const pollSchema = new mongoose.Schema({
  room: { type: String, required: true },
  question: { type: String, required: true },
  options: [pollOptionSchema]
}, { timestamps: true });

module.exports = mongoose.model("Poll", pollSchema);
