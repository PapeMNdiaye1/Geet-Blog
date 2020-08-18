const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const likedPost = new mongoose.Schema({
  postId: {
    type: String,
    required: true,
  },
});
// ########################################
const OneOfMyChat = new mongoose.Schema({
  chatIdentification: {
    type: String,
    required: true,
  },
  contactId: {
    type: String,
    required: true,
  },
  contactName: {
    type: String,
    required: true,
  },
  messageTime: {
    type: String,
    required: false,
  },
});
// ########################################

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
    default: "...",
  },
  profilePicture: {
    type: String,
    required: false,
  },
  allLikedPosts: {
    type: [likedPost],
    require: false,
  },
  allMyChats: {
    type: [OneOfMyChat],
    require: false,
  },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Users", userSchema);
