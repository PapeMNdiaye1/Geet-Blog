const mongoose = require("mongoose");

// ##########################################################
const responseSchema = new mongoose.Schema({
  authorId: {
    type: String,
    required: true,
  },
  responseAuthorName: {
    type: String,
    required: true,
  },
  responseAuthorPicture: {
    type: String,
    required: false,
  },
  response: {
    type: String,
    required: true,
  },
  responseDate: {
    type: String,
    required: true,
  },
});
// ##########################################################
const postSchema = new mongoose.Schema({
  postImage: {
    type: String,
    required: false,
  },
  postImageId: {
    type: String,
    required: false,
  },
  postAuthorId: {
    type: String,
    required: true,
  },
  postAuthorPicture: {
    type: String,
    required: false,
  },
  postAuthorName: {
    type: String,
    required: true,
  },
  postTitle: {
    type: String,
    required: true,
  },
  postDescription: {
    type: String,
    required: true,
  },
  nofLikes: {
    type: Number,
    required: false,
    default: 0,
  },
  postDate: {
    type: String,
    required: true,
  },
  postResponses: {
    type: [responseSchema],
    required: false,
  },
});

module.exports = mongoose.model("Posts", postSchema);
