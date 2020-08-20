const bcrypt = require("bcrypt");
const Users = require("../../Models/UserModel");
const FriendsContainer = require("../../Models/FriendModel");

// ###############################################################################
exports.signUp = (req, res) => {
  bcrypt
    .hash(req.body.Password, 10)
    .then((hash) => {
      const user = new Users({
        username: req.body.Name,
        email: req.body.Email,
        password: hash,
        profilePicture: req.body.ProfilePicture,
      });
      user
        .save()
        .then(() => {
          const friendsContainer = new FriendsContainer({
            userId: user._id,
          });
          friendsContainer
            .save()
            .then(() => {
              res.status(201).json({ UserLogin: true });
            })
            .catch((error) => {
              res.status(400).json({ UserLogin: false });
            });
        })
        .catch((error) => {
          if (error.errors.email.path || error.errors.email.path == "email") {
            res.status(403).json({ UserLogin: "Email Already Exists" });
          } else {
            res.status(400).json({ UserLogin: false });
          }
        });
    })
    .catch((error) => res.status(500).json({ UserLogin: false }));
};
// ###############################################################################
exports.login = (req, res) => {
  Users.findOne({ email: req.body.Email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ UserLogin: false });
      }
      bcrypt
        .compare(req.body.Password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ UserLogin: false });
          }
          res.status(200).json({
            UserLogin: true,
            userId: user._id,
            token: "TOKEN",
          });
        })
        .catch((error) => res.status(500).json({ UserLogin: false }));
    })
    .catch((error) => res.status(500).json({ UserLogin: false }));
};
// ###############################################################################
exports.getUserInfos = (req, res) => {
  Users.findOne({ email: req.params.UserEmail })
    .select("_id username email profilePicture allLikedPosts description")
    .then(function (result) {
      res.status(201).json({ User: result });
    })
    .catch((error) => {
      res.status(404).json({ User: false });
    });
};
// ###############################################################################
exports.getUserProfile = (req, res) => {
  Users.findOne({ _id: req.params.id })
    .select("username email profilePicture allLikedPosts description")
    .then((result) => {
      res.status(201).json({ User: result });
    })
    .catch((err) => {
      res.status(404).json({ User: false });
    });
};
// ###############################################################################
exports.deleteUser = (req, res) => {
  try {
    Users.deleteOne({ _id: req.params.id }, (err) => {
      if (err) {
        console.log(err);
      } else {
        res.status(201).json({ message: true });
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ###############################################################################
exports.getAllLikedPosts = (req, res) => {
  Users.findOne({ _id: req.params.id })
    .select("allLikedPosts")
    .then((allLikedPosts) => {
      res.status(201).json({ response: allLikedPosts });
    })
    .catch((err) => {
      res.status(404).json({ response: false });
    });
};
// ###############################################################################
exports.getLastUsers = (req, res) => {
  Users.find()
    .sort({ _id: -1 })
    .limit(5)
    .select("_id username profilePicture description")
    .then((result) => {
      if (result) {
        res.status(200).json({ User: result });
      } else {
        res.status(404).json({ User: false });
      }
    })
    .catch((error) => {
      res.status(500).json({ User: false });
    });
};
// ###############################################################################
exports.getSomeUsers = (req, res) => {
  Users.find()
    .sort({ _id: -1 })
    .skip(Number(req.params.id))
    .limit(5)
    .select("_id username profilePicture description")
    .then((result) => {
      if (result) {
        res.status(200).json({ User: result });
      } else {
        res.status(404).json({ User: false });
      }
    })
    .catch((err) => {
      res.status(500).json({ User: err.message });
    });
};
// ###############################################################################
exports.updateDescription = (req, res) => {
  Users.findOneAndUpdate(
    { _id: req.params.id },
    { description: req.body.Description },
    (error, success) => {
      if (error) {
        res.status(400).json({ response: false });
      } else {
        res.status(201).json({ response: true });
      }
    }
  );
};
// ###############################################################################
exports.updateProfilePicture = (req, res) => {
  Users.findOneAndUpdate(
    { _id: req.params.id },
    { profilePicture: req.body.NewProfilePicture },
    (error) => {
      if (error) {
        res.status(400).json({ response: false });
      } else {
        res.status(201).json({ response: true });
      }
    }
  );
};
