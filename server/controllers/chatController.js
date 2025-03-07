// /controllers/chatController.js
const Chat = require("../models/chatModel");

// Existing functions for joinRoom, sendMessage, updateMessage, deleteMessage…
const joinRoom = async (socket, data) => {
  const { room, username } = data;
  socket.join(room);
  console.log(`👥 ${username} joined room: ${room}`);
  try {
    const chatHistory = await Chat.find({ room }).sort({ _id: 1 });
    socket.emit("chat_history", chatHistory);
  } catch (error) {
    console.error("Error fetching chat history:", error);
  }
};

const sendMessage = async (socket, data, io) => {
  const { room, username, text } = data;
  const timestamp = new Date().toLocaleTimeString();
  try {
    const newMessage = new Chat({ room, username, text, timestamp });
    await newMessage.save();
    io.to(room).emit("receive_message", {
      _id: newMessage._id,
      room,
      username,
      text,
      timestamp,
      seenBy: newMessage.seenBy  // initially empty
    });
  } catch (error) {
    console.error("Error saving message:", error);
  }
};

const updateMessage = async (socket, data, io) => {
  const { messageId, newText, room, username } = data;
  try {
    const message = await Chat.findById(messageId);
    if (!message || message.username !== username) {
      socket.emit("error", { message: "Unauthorized or message not found." });
      return;
    }
    message.text = newText;
    message.timestamp = new Date().toLocaleTimeString();
    await message.save();
    io.to(room).emit("message_updated", {
      messageId,
      newText,
      timestamp: message.timestamp
    });
  } catch (error) {
    socket.emit("error", { message: "Error updating message." });
  }
};

const deleteMessage = async (socket, data, io) => {
  const { messageId, room, username } = data;
  try {
    const message = await Chat.findById(messageId);
    if (!message || message.username !== username) {
      socket.emit("error", { message: "Unauthorized or message not found." });
      return;
    }
    await message.deleteOne();
    io.to(room).emit("message_deleted", { messageId: message._id.toString() });
  } catch (error) {
    socket.emit("error", { message: "Error deleting message." });
  }
};

// NEW: Mark messages as seen for a given user in a room.
const markMessagesSeen = async (socket, data, io) => {
  // data should include: { room, username }
  const { room, username } = data;
  try {
    // Update all messages in the room where the user hasn't been added yet
    await Chat.updateMany(
      { room: data.room, seenBy: { $ne: data.username } },
      { $addToSet: { seenBy: data.username } }
    );
    // Fetch updated chat history for the room
    const updatedChatHistory = await Chat.find({ room: data.room }).sort({ _id: 1 });
    // Emit the updated chat history to everyone in the room
    io.to(data.room).emit("chat_history", updatedChatHistory);
  } catch (error) {
    socket.emit("error", { message: "Error marking messages as seen." });
  }
};

module.exports = { joinRoom, sendMessage, updateMessage, deleteMessage, markMessagesSeen };
