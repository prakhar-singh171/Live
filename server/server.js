// server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

// Import chat and poll controller functions
const { joinRoom, sendMessage, updateMessage, deleteMessage,markMessagesSeen } = require("./controllers/chatController");
const { createPoll, votePoll,getPollsByRoom } = require("./controllers/pollController");

const app = express();
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(express.json());

// Create HTTP server and initialize Socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Socket.io connection
io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Chat events
  socket.on("join_room", async (data) => {
    await joinRoom(socket, data);
    try {
      const polls = await getPollsByRoom(data.room);
      socket.emit("poll_history", polls);
    } catch (error) {
      console.error("Error fetching poll history:", error);
    }
  });

  socket.on("chat_history", (history) => {
    console.log("🔍 Server sent chat history:", history);
  });

  socket.on("mark_seen", async (data) => {
    console.log("Received markMessagesSeen event from client:", data);
    await markMessagesSeen(socket, data, io);
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

  // Poll events
  socket.on("create_poll", async (data) => {
    // data should include: { room, question, options }
    await createPoll(socket, data, io);
  });
  socket.on("vote_poll", async (data) => {
    // data should include: { pollId, option, username }
    await votePoll(socket, data, io);
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
