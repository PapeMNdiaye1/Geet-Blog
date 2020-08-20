const Posts = require("../../Models/PostModel");
const Users = require("../../Models/UserModel");
// ##############################################################################
exports.creatPost = (req, res) => {
  const post = new Posts({
    postAuthorId: req.body.UserId,
    postAuthorPicture: req.body.UserProfilePicture,
    postAuthorName: req.body.UserName,
    postImage: req.body.PostImage,
    postImageId: req.body.PostImageId,
    postTitle: req.body.PostTitle,
    postDescription: req.body.PostDescription,
    postDate: req.body.PostDate,
  });
  post
    .save()
    .then(() => {
      res.status(201).json({ NewPostid: post._id });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};
// ##############################################################################
exports.getLastPost = (req, res) => {
  Posts.find()
    .sort({ postDate: -1 })
    .limit(5)
    .select(
      "_id postTitle nofLikes postDescription postImage postImageId postAuthorId postAuthorPicture postAuthorPicture postAuthorName postDate postResponses.length"
    )
    .then((allposts) => {
      if (allposts) {
        res.status(200).json({ allposts: allposts });
      } else {
        res.status(404).json({ allposts: "db is empty" });
      }
    })
    .catch((err) => {
      res.status(500).json({ messages: err.message });
    });
};
// ##############################################################################
exports.getSomePost = (req, res) => {
  Posts.find()
    .sort({ postDate: -1 })
    .skip(Number(req.params.id))
    .limit(3)
    .select(
      "_id postTitle nofLikes postDescription postImage postImageId postAuthorId postAuthorPicture postAuthorPicture postAuthorName postDate postResponses.length"
    )
    .then((allposts) => {
      if (allposts) {
        res.status(200).json({ allposts: allposts });
      } else {
        res.status(404).json({ allposts: "db is empty" });
      }
    })
    .catch((err) => {
      res.status(500).json({ messages: err.message });
    });
};
// ##############################################################################
exports.getAllMyPost = (req, res) => {
  Posts.find({ postAuthorId: req.params.id })
    .select(
      "_id postTitle nofLikes postDescription postImage postImageId postAuthorId postAuthorPicture postAuthorPicture postAuthorName postDate postResponses.length"
    )
    .then((allposts) => {
      if (allposts) {
        res.status(200).json({ allposts: allposts.reverse() });
      } else {
        res.status(404).json({ allposts: "db is empty" });
      }
    })
    .catch((err) => {
      res.status(500).json({ messages: err.message });
    });
};
// ##############################################################################
exports.deletePost = async (req, res) => {
  try {
    var thePostToDelete = await req.params.id;
    Posts.deleteOne({ _id: thePostToDelete }, (err) => {
      if (err) {
        console.log(error);
      } else {
        res.status(201).json({ message: true });
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ##############################################################################
exports.getOnePost = async (req, res) => {
  Posts.findOne({ _id: req.params.id })
    .then(function (result) {
      res.status(201).json({ Post: result });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ Post: "Post not fund" });
    });
};
// ##############################################################################
exports.addNewResponse = (req, res) => {
  var response = {
    authorId: req.body.AuthorId,
    responseAuthorName: req.body.ResponseAuthorName,
    responseAuthorPicture: req.body.ResponseAuthorPicture,
    response: req.body.Response,
    responseDate: req.body.ResponseDate,
  };
  Posts.findOneAndUpdate(
    { _id: req.params.id },
    { $push: { postResponses: response } },
    (error) => {
      if (error) {
        console.log(error);
        res.status(400).json({ response: false });
      } else {
        res.status(201).json({ response: true });
      }
    }
  );
};
// ##############################################################################
exports.getAllResponsesOfOnePost = (req, res) => {
  Posts.findOne({ _id: req.params.id })
    .select("postResponses")
    .then((allresponse) => {
      if (allresponse) {
        res.status(200).json({ allresponse: allresponse });
      } else {
        res.status(404).json({ allresponse: "db is empty" });
      }
    })
    .catch((err) => {
      res.status(500).json({ messages: err.message });
    });
};
// ##############################################################################
exports.likeAndDislike = async (req, res) => {
  let likedpost = {
    postId: req.params.id,
  };
  if (req.body.operation === "like") {
    Posts.findOneAndUpdate(
      { _id: req.params.id },
      { nofLikes: req.body.N }
    ).then(
      Users.findOneAndUpdate(
        { _id: req.body.UserId },
        { $push: { allLikedPosts: likedpost } },
        (error) => {
          if (error) {
            console.log(error);
            res.status(400).json({ response: false });
          } else {
            res.status(201).json({ response: true });
          }
        }
      )
    );
  } else {
    Posts.findOneAndUpdate(
      { _id: req.params.id },
      { nofLikes: req.body.N }
    ).then(
      Users.findOneAndUpdate(
        { _id: req.body.UserId },
        { $pull: { allLikedPosts: likedpost } },
        (error) => {
          if (error) {
            console.log(error);
            res.status(400).json({ response: false });
          } else {
            res.status(201).json({ response: true });
          }
        }
      )
    );
  }
};
// ##############################################################################
exports.deletResponse = (req, res) => {
  Posts.findOneAndUpdate(
    { _id: req.params.id },
    { $pull: { postResponses: { _id: req.body.id } } },
    (error, success) => {
      if (error) {
        console.log(error);
        res.status(400).json({ response: false });
      } else {
        res.status(201).json({ response: true });
      }
    }
  );
};
// #############################################################################
exports.modifyPost = (req, res) => {
  console.log(req.params.id);
  Posts.findOneAndUpdate(
    { _id: req.params.id },
    { postTitle: req.body.PostTitle, postDescription: req.body.PostDescription }
  )
    .then((response) => {
      if (response) {
        console.log("Post Modify");
        res.status(200).json({ response: true });
      } else {
        res.status(404).json({ response: "db is empty" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ messages: err.message });
    });
};
