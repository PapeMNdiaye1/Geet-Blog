const express = require("express");
const router = express.Router();
const ChatCtrl = require("./Controllers/ChatControllers");
// ############################################
router.post("/find-a-chat/:id", ChatCtrl.findAChat);
// ############################################
router.get("/get-last-contacts/:id", ChatCtrl.getLastContacts);
// ############################################
router.get(
  "/get-contact-profile-picture/:id",
  ChatCtrl.getContactProfilePicture
);
// ############################################
router.post("/get-all-message/:id", ChatCtrl.getAllMessage);
// ############################################
router.post("/send-message/:id", ChatCtrl.sendMessage);
// ############################################
router.get("/get-Last-Mes/:id", ChatCtrl.getLastMes);

module.exports = router;
