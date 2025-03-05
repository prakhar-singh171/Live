require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const chatRoutes = require("./routes/chatRoutes");
const Chat = require("./models/chatModel");

// Initialize app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// API Routes
app.use("/api/chat", chatRoutes);

// WebSocket Logic
io.on("connection", (socket) => {
  console.log(`✅ New connection: ${socket.id}`);

  socket.on("join_room", async ({ room, username }) => {
    socket.join(room);
    console.log(`👥 ${username} joined room: ${room}`);

    // Fetch chat history
    const chatHistory = await Chat.find({ room }).sort({ _id: 1 });
    socket.emit("chat_history", chatHistory);
  });

  socket.on("send_message", async (data) => {
    const { room, username, text } = data;
    const timestamp = new Date().toLocaleTimeString();
  
    const newMessage = new Chat({ room, username, text, timestamp });
    await newMessage.save();
  
    console.log(`💬 ${username} sent: ${text} in room ${room}`);
  
    // Emit message only once
    io.to(room).emit("receive_message", { room, username, text, timestamp });
  });
  

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Start Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
