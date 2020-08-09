const express = require("express");
const router = express.Router();
const FriendCtrl = require("./Controllers/FriendsControllers");

// ############################################
router.get("/get-all-friends/:id", FriendCtrl.getAllFriends);
// ############################################
router.get(
  "/get-all-friends-and-followers/:id",
  FriendCtrl.getAllFriendsAndFollowers
);
// ############################################
router.post("/follow/:id", FriendCtrl.follow);
// ############################################
router.post("/unFollow/:id", FriendCtrl.unFollow);
// ############################################
router.post("/add-follower/:id", FriendCtrl.addFollower);
// ############################################
router.post("/remove-follower/:id", FriendCtrl.removeFollower);

module.exports = router;
