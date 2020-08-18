const Chats = require("../../Models/ChatModel");
const Users = require("../../Models/UserModel");
// ############################################################
exports.findAChat = async (req, res) => {
  Chats.findOne({ chatIdentification: req.params.id })
    .then(async (result) => {
      if (result !== null) {
        res.status(201).json({ chatIdentification: true });
      } else {
        const chat = await new Chats({
          chatIdentification: [
            `${req.body.UserId}-${req.body.ContactId}`,
            `${req.body.ContactId}-${req.body.UserId}`,
          ],
          lastMessageTime: "0/5/2002",
          chatMembers: [req.body.UserId, req.body.ContactId],
          chatMembersName: [req.body.UserName, req.body.ContactName],
        });
        chat
          .save()
          .then(async (result) => {
            try {
              const myNewChat = await {
                chatIdentification: `${req.body.UserId}-${req.body.ContactId}`,
                contactId: req.body.ContactId,
                messageTime: req.body.Date,
                contactName: req.body.ContactName,
              };
              const myContactNewChat = await {
                chatIdentification: `${req.body.UserId}-${req.body.ContactId}`,
                contactId: req.body.UserId,
                messageTime: req.body.Date,
                contactName: req.body.ContactName,
              };
              Users.findOneAndUpdate(
                { _id: req.body.UserId },
                { $push: { allMyChats: myNewChat } },
                (error) => {
                  if (error) {
                    res.status(400).json({ chatIdentification: false });
                  } else {
                    Users.findOneAndUpdate(
                      { _id: req.body.ContactId },
                      { $push: { allMyChats: myContactNewChat } },
                      (error) => {
                        if (error) {
                          res.status(400).json({ chatIdentification: false });
                        } else {
                          res.status(201).json({ chatIdentification: true });
                        }
                      }
                    );
                  }
                }
              );
            } catch (error) {
              res.status(500).json({ chatIdentification: false });
            }
          })
          .catch((error) => {
            console.log(error);
            res.status(500).json({ chatIdentification: false });
          });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ chatIdentification: false });
    });
};
// ############################################################
exports.getLastContacts = async (req, res) => {
  Users.findOne({ _id: req.params.id })
    .select("allMyChats ")
    .then(function (result) {
      res.status(201).send({ contacts: result.allMyChats.reverse() });
    })
    .catch((error) => {
      res.status(404).send({ contacts: false });
    });
};
// ############################################################
exports.getContactProfilePicture = async (req, res) => {
  Users.findOne({ _id: req.params.id })
    .select("profilePicture")
    .then((result) => {
      if (result !== null) {
        res.status(201).send({ contactProfilePicture: result });
      } else {
        res.status(404).send({ contactProfilePicture: false });
      }
    })
    .catch((error) => {
      res.status(500).send({ contactProfilePicture: false });
    });
};
// ############################################################
exports.getAllMessage = async (req, res) => {
  Chats.findOne({ chatIdentification: req.params.id })
    .select("message")
    .then((result) => {
      if (result !== null) {
        res.status(201).send({ messages: result });
      } else {
        res.status(404).send({ messages: false });
      }
    })
    .catch((error) => {
      res.status(500).send({ messages: false });
    });
};
// ############################################################
exports.sendMessage = async (req, res) => {
  let newMessage = await {
    messageN: Number(req.body.MessageN),
    messageAuthorId: req.body.MessageAuthorId,
    messageText: req.body.MessageText,
    messageTime: req.body.MessageTime,
  };
  Chats.findOneAndUpdate(
    { chatIdentification: req.params.id },
    { $push: { message: newMessage } },
    (error) => {
      if (error) {
        console.log(error);
        res.status(400).json({ response: false });
      } else {
        Users.findOneAndUpdate(
          {
            _id: req.body.MessageAuthorId,
            "allMyChats.contactId": req.body.ContactId,
          },
          { $set: { "allMyChats.$.messageTime": req.body.MessageTime } },
          function (error) {
            if (error) {
              res.status(404).json({ response: false });
            } else {
              Users.findOneAndUpdate(
                {
                  _id: req.body.ContactId,
                  "allMyChats.contactId": req.body.MessageAuthorId,
                },
                { $set: { "allMyChats.$.messageTime": req.body.MessageTime } },
                function (error) {
                  if (error) {
                    res.status(404).json({ response: false });
                  } else {
                    res.status(201).json({ response: true });
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};
// ###########################################################
// exports.getLastMes = async (req, res) => {
//   Chats.findOne(
//     { chatIdentification: req.params.id },
//     { message: { $slice: -2 } }
//   )
//     .then((result) => {
//       console.log(result.message);
//       if (result !== null) {
//         res.status(201).send({ messages: result });
//       } else {
//         res.status(404).send({ messages: false });
//       }
//     })
//     .catch((error) => {
//       res.status(500).send({ messages: false });
//     });
// };
