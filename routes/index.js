const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../controllers/user");
const Post = require("../controllers/post");
const Comment = require("../controllers/comment");
const Like = require("../controllers/like");
const Auth = require("../controllers/auth");
const Profile = require("../controllers/profile");
const { authenticateToken } = require("../middleware/authenticateToken");
const { checkUserExists } = require("../middleware/checkUserExists");
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
router.get("/profile", authenticateToken, checkUserExists, Profile.getProfile);
router.put(
  "/profile/:id",
  authenticateToken,
  checkUserExists,
  editProfile,
  Profile.updateProfile
);
router.delete(
  "/profile/:id",
  authenticateToken,
  checkUserExists,
  editProfile,
  Profile.deleteProfile
);

// User routes
router.get("/users", authenticateToken, checkUserExists, User.getAllUsers);
router.get("/users/:id", authenticateToken, checkUserExists, User.getUserById);

// Post routes
router.post("/posts", authenticateToken, checkUserExists, Post.createPost);
router.get("/posts", authenticateToken, checkUserExists, Post.getAllPosts);
router.get("/posts/:id", authenticateToken, checkUserExists, Post.getPostById);
router.delete(
  "/posts/:id",
  authenticateToken,
  checkUserExists,
  Post.deletePost
);
router.put("/posts/:id", authenticateToken, checkUserExists, Post.updatePost);

// Comment routes
router.post(
  "/comments",
  authenticateToken,
  checkUserExists,
  Comment.createComment
);
router.put(
  "/comments/:id",
  authenticateToken,
  checkUserExists,
  Comment.updateComment
);
router.delete(
  "/comments/:id",
  authenticateToken,
  checkUserExists,
  Comment.deleteComment
);

// Like routes
router.post(
  "/likes/post",
  authenticateToken,
  checkUserExists,
  Like.toggleLikePost
);
router.post(
  "/likes/comment",
  authenticateToken,
  checkUserExists,
  Like.toggleLikeComment
);

module.exports = router;
