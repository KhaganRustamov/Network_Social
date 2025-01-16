const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../controllers/user");
const Post = require("../controllers/post");
const Comment = require("../controllers/comment");
const Like = require("../controllers/like");
const Auth = require("../controllers/auth");
const Profile = require("../controllers/profile");
const { checkSession } = require("../middleware/checkSession");
const { editProfile } = require("../middleware/editProfile");
const { editComment } = require("../middleware/editComment");
const { editPost } = require("../middleware/editPost");

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
router.post("/logout", checkSession, Auth.logout);
// router.post("/refreshToken", Auth.refreshToken);

// Profile routes
router.get("/profile", checkSession, Profile.getProfile);
router.put("/profile/:id", checkSession, editProfile, Profile.updateProfile);
router.delete("/profile/:id", checkSession, editProfile, Profile.deleteProfile);

// User routes
router.get("/users", checkSession, User.getAllUsers);
router.get("/users/:id", checkSession, User.getUserById);

// Post routes
router.post("/posts", checkSession, Post.createPost);
router.get("/posts", checkSession, Post.getAllPosts);
router.get("/posts/:id", checkSession, Post.getPostById);
router.delete("/posts/:id", checkSession, editPost, Post.deletePost);
router.put("/posts/:id", checkSession, editPost, Post.updatePost);

// Comment routes
router.post("/comments", checkSession, Comment.createComment);
router.put("/comments/:id", checkSession, editComment, Comment.updateComment);
router.delete(
  "/comments/:id",
  checkSession,
  editComment,
  Comment.deleteComment
);

// Like routes
router.post("/likes/post", checkSession, Like.toggleLikePost);
router.post("/likes/comment", checkSession, Like.toggleLikeComment);

module.exports = router;
