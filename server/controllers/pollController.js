// /controllers/pollController.js
const Poll = require("../models/pollModel");

const createPoll = async (socket, data, io) => {
  try {
    const { room, question, options } = data;
    // Create poll options array with each option having votes and an empty votedBy list
    const pollOptions = options.map(opt => ({ option: opt, votes: 0, votedBy: [] }));
    const newPoll = new Poll({
      room,
      question,
      options: pollOptions,
      createdAt: Date.now()
    });
    await newPoll.save();
    console.log(`Poll created in room ${room}: ${question}`);
    // Broadcast the newly created poll to everyone in the room
    io.to(room).emit("poll_created", newPoll);
  } catch (error) {
    console.error("Error creating poll:", error);
    socket.emit("error", { message: "Error creating poll." });
  }
};

const votePoll = async (socket, data, io) => {
    try {
      const { pollId, option, username } = data;
      console.log(data);
      const poll = await Poll.findById(pollId);
      if (!poll) {
        socket.emit("error", { message: "Poll not found." });
        return;
      }
      // Ensure every option has a votedBy array
      poll.options.forEach(opt => {
        if (!opt.votedBy) {
          opt.votedBy = [];
        }
      });
      // Check if user already voted in any option
      console.log(poll);
      const alreadyVoted = poll.options.some(opt => Array.isArray(opt.votedBy) && opt.votedBy.includes(username));

      if (alreadyVoted) {
        socket.emit("error", { message: "You have already voted on this poll." });
        return;
      }
      console.log('ddd');

      // Find the option to vote for
      const selectedOption = option.option;  // Extracting the actual option string
      const pollOption = poll.options.find(opt => String(opt.option) === String(selectedOption));
      
      console.log("Selected Option:", selectedOption);
      console.log("Found Option:", pollOption);
      
      console.log(pollOption);
      if (!pollOption) {
        console.log('tt')
        socket.emit("error", { message: "Option not found." });
        return;
      }

      pollOption.votes += 1;
      pollOption.votedBy.push(username);
      await poll.save();
      console.log(`User ${username} voted for "${option}" on poll ${pollId}.`);
      io.to(poll.room).emit("poll_updated", poll);
    } catch (error) {
      console.error("Error voting on poll:", error);
      socket.emit("error", { message: "Error voting on poll." });
    }
  };

  
  const getPollsByRoom = async (room) => {
    try {
      const polls = await Poll.find({ room }).sort({ createdAt: 1 });
      return polls;
    } catch (error) {
      throw error;
    }
  };

module.exports = { createPoll, votePoll,getPollsByRoom };
