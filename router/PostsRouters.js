const express = require("express");
const router = express.Router();
const PostCtrl = require("./Controllers/PostsControllers");
// ###########################
router.post("/creat-post", PostCtrl.creatPost);
// ###########################
router.get("/get-last-post", PostCtrl.getLastPost);
// ###########################
router.get("/get-some-post/:id", PostCtrl.getSomePost);
// ###########################
router.get("/only-my-post/:id", PostCtrl.getAllMyPost);
// ###########################
router.delete("/delete-one-post/:id", PostCtrl.deletePost);
// ###########################
router.get("/one-post/:id", PostCtrl.getOnePost);
// ###########################
router.post("/add-response/:id", PostCtrl.addNewResponse);
// ###########################
router.get("/get-all-response/:id", PostCtrl.getAllResponsesOfOnePost);
// ###########################
router.post("/like-and-dislike/:id", PostCtrl.likeAndDislike);
// ###########################
router.post("/delete-one-response/:id", PostCtrl.deletResponse);
// ###########################
router.post("/modify-post/:id", PostCtrl.modifyPost);

module.exports = router;
