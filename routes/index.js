const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../controllers/user");
const Post = require("../controllers/post");
const Comment = require("../controllers/comment");
const Like = require("../controllers/like");
const { authenticateToken } = require("../middleware/authMiddleware");

const uploadDestination = "uploads";

const storage = multer.diskStorage({
  destination: uploadDestination,
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const uploads = multer({ storage: storage });

// Auth routes
router.post("/register", User.register);
router.post("/login", User.login);
router.post("/logout", User.logout);

// User routes
router.get("/users/:id", authenticateToken, User.getUserById);
router.put("/users/:id", authenticateToken, User.updateUser);
router.delete("/users/:id", authenticateToken, User.deleteUser);
router.get("/profile", authenticateToken, User.profile);

// Post routes
router.post("/posts", authenticateToken, Post.createPost);
router.get("/posts", authenticateToken, Post.getAllPosts);
router.get("/posts/:id", authenticateToken, Post.getPostById);
router.delete("/posts/:id", authenticateToken, Post.deletePost);
router.put("/posts/:id", authenticateToken, Post.updatePost);

// Comment routes
router.post("/comments", authenticateToken, Comment.createComment);
router.put("/comments/:id", authenticateToken, Comment.updateComment);
router.delete("/comments/:id", authenticateToken, Comment.deleteComment);

// Like routes
router.post("/likes/post", authenticateToken, Like.toggleLikePost);
router.post("/likes/comment", authenticateToken, Like.toggleLikeComment);

module.exports = router;
