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
router.post("/send-message/:id", ChatCtrl.sendMessage);
// ############################################
router.post("/get-Last-Mes/:id", ChatCtrl.getLastMes);
// ############################################
router.post("/delete-chat/:id", ChatCtrl.deleteChat);
// ############################################
router.post("/delete-message/:id", ChatCtrl.deleteMessage);
// ############################################
router.post("/refresh/:id", ChatCtrl.refresh);
// ############################################
router.get("/get-deleted-messages/:id", ChatCtrl.getDeletedMessages);

module.exports = router;
