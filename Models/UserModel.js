const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const likedPost = new mongoose.Schema({
  postId: {
    type: String,
    required: true,
  },
});

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
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Users", userSchema);
