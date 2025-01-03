const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../controllers/user");
const Post = require("../controllers/post");
const Comment = require("../controllers/comment");
const Like = require("../controllers/like");
const Auth = require("../controllers/auth");
const Profile = require("../controllers/profile");
const { accessToken } = require("../middleware/accessToken");
const { refreshToken } = require("../middleware/refreshToken");
const { editProfile } = require("../middleware/editProfile");

const uploadDestination = "uploads";

const storage = multer.diskStorage({
  destination: uploadDestination,
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const uploads = multer({ storage: storage });

// Auth routes
router.post("/register", Auth.register);
router.post("/login", Auth.login);
router.post("/logout", Auth.logout);
router.post("/refreshToken", Auth.refreshToken);

// Profile routes
router.get("/profile", accessToken, refreshToken, Profile.getProfile);
router.put(
  "/profile/:id",
  accessToken,
  refreshToken,
  editProfile,
  Profile.updateProfile
);
router.delete(
  "/profile/:id",
  accessToken,
  refreshToken,
  editProfile,
  Profile.deleteProfile
);

// User routes
router.get("/users", accessToken, refreshToken, User.getAllUsers);
router.get("/users/:id", accessToken, refreshToken, User.getUserById);

// Post routes
router.post("/posts", accessToken, refreshToken, Post.createPost);
router.get("/posts", accessToken, refreshToken, Post.getAllPosts);
router.get("/posts/:id", accessToken, refreshToken, Post.getPostById);
router.delete("/posts/:id", accessToken, refreshToken, Post.deletePost);
router.put("/posts/:id", accessToken, refreshToken, Post.updatePost);

// Comment routes
router.post("/comments", accessToken, refreshToken, Comment.createComment);
router.put("/comments/:id", accessToken, refreshToken, Comment.updateComment);
router.delete(
  "/comments/:id",
  accessToken,
  refreshToken,
  Comment.deleteComment
);

// Like routes
router.post("/likes/post", accessToken, refreshToken, Like.toggleLikePost);
router.post(
  "/likes/comment",
  accessToken,
  refreshToken,
  Like.toggleLikeComment
);

module.exports = router;
