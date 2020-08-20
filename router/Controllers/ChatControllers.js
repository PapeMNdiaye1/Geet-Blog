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
          lastMessageTime: req.body.Date,
          chatMembers: [req.body.UserId, req.body.ContactId],
          chatMembersName: [req.body.UserName, req.body.ContactName],
          message: [],
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
                contactName: req.body.UserName,
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
    .select("allMyChats")
    .then(function (result) {
      res.status(201).json({ contacts: result.allMyChats.reverse() });
    })
    .catch((error) => {
      res.status(404).json({ contacts: false });
    });
};
// ############################################################
exports.getContactProfilePicture = async (req, res) => {
  Users.findOne({ _id: req.params.id })
    .select("profilePicture")
    .then((result) => {
      if (result !== null) {
        console.log(result);
        res.status(201).json({ contactProfilePicture: result });
      } else {
        res.status(404).json({ contactProfilePicture: false });
      }
    })
    .catch((error) => {
      res.status(500).json({ contactProfilePicture: false });
    });
};
// ############################################################
exports.sendMessage = async (req, res) => {
  // #######################
  Chats.findOne(
    { chatIdentification: req.params.id },
    { message: { $slice: -1 } }
  )
    .then(async (result) => {
      if (result !== null) {
        let NofMes = 1;
        if (result.message.length !== 0) {
          NofMes = result.message[0].messageN + 1;
          let newMessage = await {
            messageN: NofMes,
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
                  {
                    $set: { "allMyChats.$.messageTime": req.body.MessageTime },
                  },
                  function (error) {
                    if (error) {
                      res.status(404).json({ response: false });
                    } else {
                      Users.findOneAndUpdate(
                        {
                          _id: req.body.ContactId,
                          "allMyChats.contactId": req.body.MessageAuthorId,
                        },
                        {
                          $set: {
                            "allMyChats.$.messageTime": req.body.MessageTime,
                          },
                        },
                        function (error) {
                          if (error) {
                            res.status(404).json({ response: false });
                          } else {
                            res
                              .status(201)
                              .json({ response: true, nofMes: NofMes });
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        } else if (result.message.length === 0) {
          // console.log("eeeeeeeee");
          let newMessage = await {
            messageN: 1,
            messageAuthorId: req.body.MessageAuthorId,
            messageText: req.body.MessageText,
            messageTime: req.body.MessageTime,
          };
          Chats.findOneAndUpdate(
            { chatIdentification: req.params.id },
            { $push: { message: newMessage } },
            (error) => {
              if (error) {
                res.status(400).json({ response: false });
              } else {
                res.status(201).json({ response: true, nofMes: NofMes });
              }
            }
          );
        }
      } else {
        res.status(404).json({ messages: false });
      }
    })
    .catch((error) => {
      res.status(500).json({ messages: false });
    });
};
// ###########################################################
exports.getLastMes = async (req, res) => {
  Chats.findOne(
    { chatIdentification: req.params.id },
    { message: { $slice: req.body.NtoGrab } }
  )
    .then((result) => {
      // console.log(result.message[0].messageN + 1);
      if (result !== null) {
        res.status(201).json({ messages: result });
      } else {
        res.status(404).json({ messages: false });
      }
    })
    .catch((error) => {
      res.status(500).json({ messages: false });
    });
};
// ###########################################################
exports.deleteChat = async (req, res) => {
  Chats.deleteOne({ chatIdentification: req.params.id }, (err) => {
    if (err) {
      res.status(404).json({ response: false });
    } else {
      Users.findByIdAndUpdate(
        req.body.MyId,
        { $pull: { allMyChats: { contactId: req.body.ContactId } } },
        { safe: true, upsert: true },
        (err, node) => {
          if (err) {
            console.log(err);
            res.status(404).json({ response: false });
          } else {
            res.status(201).json({ response: true });
          }
        }
      );
    }
  });
};
// ###########################################################
exports.deleteMessage = async (req, res) => {
  Chats.findOneAndUpdate(
    { chatIdentification: req.params.id },
    { $pull: { message: { _id: req.body.MessageId } } },
    { safe: true, upsert: true },
    (err, node) => {
      if (err) {
        console.log(err);
        res.status(404).json({ response: false });
      } else {
        Chats.findOneAndUpdate(
          { chatIdentification: req.params.id },
          { $push: { deletedMessages: req.body.MessageId } },
          (err) => {
            if (err) {
              console.log(err);
              res.status(404).json({ response: false });
            } else {
              res.status(201).json({ response: true });
            }
          }
        );
      }
    }
  );
};
// ###########################################################
exports.getDeletedMessages = async (req, res) => {
  Chats.findOne({ chatIdentification: req.params.id })
    .select("deletedMessages")
    .then((result) => {
      if ((result !== null) & (result.deletedMessages.length > 0)) {
        res.status(201).json({ allDeletedMessages: result.deletedMessages });
      } else {
        res.status(200).json({ allDeletedMessages: false });
      }
    })
    .catch((error) => {
      res.status(500).json({ allDeletedMessages: false });
    });
};
// ###########################################################
exports.refresh = async (req, res) => {
  Chats.findOne(
    { chatIdentification: req.params.id },
    { message: { $slice: -1 } }
  )
    .then(async (result) => {
      if (result !== null) {
        if (result.message[0].messageN > req.body.CurrentlyLastMessageN) {
          let N = -(
            result.message[0].messageN - req.body.CurrentlyLastMessageN
          );
          Chats.findOne(
            { chatIdentification: req.params.id },
            { message: { $slice: N } }
          )
            .then((result) => {
              if (result !== null) {
                res.status(201).json({ messages: result });
              } else {
                res.status(404).json({ messages: false });
              }
            })
            .catch((error) => {
              res.status(200).json({ messages: false });
            });
        } else {
          res.status(200).json({ messages: false });
        }
      } else {
        res.status(500).json({ messages: false });
      }
    })
    .catch((error) => {
      res.status(404).json({ messages: false });
    });
};
