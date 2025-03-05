const express = require("express");
const { getChatHistory, saveMessage } = require("../controllers/chatController");

const router = express.Router();

router.get("/:room", getChatHistory); // Get chat history for a room
router.post("/", saveMessage); // Save a new message

module.exports = router;
