const express = require("express");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const app = express();
// ###################################################
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const Port = process.env.PORT || 5000;

// ###################################################
//                 ? MONGODB
const mongoURI = "mongodb://localhost/MyAPI";
// const mongoURI =
//   process.env.MONGODB_URI ||
//   "mongodb+srv://papediop:papediop@cluster0.zh0ir.mongodb.net/GEEKBLOGDB?retryWrites=true&w=majority";
mongoose.connect(mongoURI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
});
const conn = mongoose.connection;
conn.on("error", (error) => {
  console.log(error);
});
// Init gfs
let gfs;
conn.once("open", () => {
  console.log("db Connected");
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});
// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({ storage });
// ?#####################################################################################
app.post("/upload", upload.single("file"), (req, res) => {
  // console.log(req.file);
  res.json({ file: req.file });
});
// ###########################################
app.get("/image/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        file: "No file exists",
      });
    }
    if (
      file.contentType === "image/jpeg" ||
      file.contentType === "image/png" ||
      file.contentType === "image/gif"
    ) {
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        file: "Not an image",
      });
    }
  });
});
// ##########################################
app.delete("/files/:id", (req, res) => {
  // console.log(req.params.id);
  gfs.remove({ _id: req.params.id, root: "uploads" }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    } else {
      // console.log("picture Deleted");
      return res.status(201).json({ message: true });
    }
  });
});
// ?#####################################################################################
const UsersRouters = require("./router/UsersRouters");
app.use("/User", UsersRouters);
const PostsRouter = require("./router/PostsRouters");
app.use("/Post", PostsRouter);
const FollowRouter = require("./router/FriendsRouters");
app.use("/Follow", FollowRouter);
const ChatRouter = require("./router/ChatRouters");
app.use("/Chat", ChatRouter);
// ?#####################################################################################
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}
// ?######################################################################################
app.listen(Port, () => {
  console.log(`Server started on port ${Port}`);
});
