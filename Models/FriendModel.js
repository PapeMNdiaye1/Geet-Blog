const mongoose = require("mongoose");

// ##########################################################
const friendsSchema = new mongoose.Schema({
  friendId: {
    type: String,
    required: true,
  },
  friendName: {
    type: String,
    required: true,
  },
  friendProfilePicture: {
    type: String,
    required: true,
  },
});

const FriendsContainerSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  friends: {
    type: [friendsSchema],
  },
  followers: {
    type: [friendsSchema],
  },
});

module.exports = mongoose.model("FriendsContainer", FriendsContainerSchema);
