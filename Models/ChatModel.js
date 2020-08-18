const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const messageSchema = new mongoose.Schema({
  messageN: {
    type: Number,
    required: true,
  },
  messageAuthorId: {
    type: String,
    required: true,
  },
  messageText: {
    type: String,
    required: true,
  },
  messageTime: {
    type: String,
    required: true,
  },
});
// ############################################
const chatSchema = new mongoose.Schema({
  chatIdentification: {
    type: Array,
    required: true,
    unique: true,
  },
  lastMessageTime: {
    type: String,
    required: false,
  },
  chatMembers: {
    type: Array,
    required: true,
  },
  chatMembersName: {
    type: Array,
    required: true,
  },
  message: {
    type: [messageSchema],
    required: false,
  },
});

chatSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Chat", chatSchema);
