const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());

const env = require("dotenv");
env.config();

const client = require("./database/pg");

const multer = require("multer");
const multerStorage = multer({ storage: multer.memoryStorage() });

const verifyTokeMiddleWare = require("./middleware/verifyMiddleWare");

const userController = require("./controllers/userController");
const postController = require("./controllers/postController");
const likeController = require("./controllers/likeControoller");

const connectDb = async () => {
  try {
    await client.connect();
    console.log("connected to db");
  } catch (error) {
    console.log("error CONNECTING TO DB", error);
  }
};

connectDb();

//USER APIS

app.get("/signin", verifyTokeMiddleWare.verifyToken, userController.userSignIn);

app.put(
  "/updatepic",
  verifyTokeMiddleWare.verifyJwtToken,
  multerStorage.single("profile_pic"),
  userController.updateProfilePic
);
app.delete(
  "/deleteUser",
  verifyTokeMiddleWare.verifyJwtToken,
  userController.deleteUser
);

//POST APIS

app.get("/AllUsersfeed", postController.getAllUsersFeed);

app.post(
  "/createPost",
  verifyTokeMiddleWare.verifyJwtToken,
  multerStorage.single("post_pic"),
  postController.createPost
);

app.get(
  "/singleUserFeed/:user_id",
  verifyTokeMiddleWare.verifyJwtToken,
  postController.getSingleUserFeed
);
app.get(
  "/getLoggedInUserFeed",
  verifyTokeMiddleWare.verifyJwtToken,
  postController.getLoggedInUserFeed
);
app.delete(
  "/deletePost/:post_id",
  verifyTokeMiddleWare.verifyJwtToken,
  postController.deletePost
);

//LIKE APIS
app.put(
  "/posts/:post_id/like",
  verifyTokeMiddleWare.verifyJwtToken,
  likeController.likePost
);
app.put(
  "/posts/:post_id/unlike",
  verifyTokeMiddleWare.verifyJwtToken,
  likeController.unlikePost
);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
