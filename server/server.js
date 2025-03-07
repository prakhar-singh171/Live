// server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

// Import controller functions
const { joinRoom, sendMessage, updateMessage, deleteMessage, markMessagesSeen } = require("./controllers/chatController");

const app = express();
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Socket.io connection
io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  socket.on("join_room", async (data) => {
    await joinRoom(socket, data);
    // Optionally, immediately mark all messages as seen upon joining:
    await markMessagesSeen(socket, { room: data.room, username: data.username }, io);
  });

  socket.on("send_message", async (data) => {
    await sendMessage(socket, data, io);
  });

  socket.on("update_message", async (data) => {
    await updateMessage(socket, data, io);
  });

  socket.on("delete_message", async (data) => {
    await deleteMessage(socket, data, io);
  });

  // NEW: When a user marks messages as seen (could be triggered later)
  socket.on("mark_seen", async (data) => {
    await markMessagesSeen(socket, data, io);
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
