const express = require("express");
const router = express.Router();
const multer = require("multer");
const UserController = require("../controllers/user");
const PostController = require("../controllers/post");
const CommentController = require("../controllers/comment");
const { authenticateToken } = require("../middleware/auth");

const uploadDestination = "uploads";

const storage = multer.diskStorage({
  destination: uploadDestination,
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const uploads = multer({ storage: storage });

// User routes
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/users/:id", authenticateToken, UserController.getUserById);
router.put("/users/:id", authenticateToken, UserController.updateUser);
router.delete("/users/:id", authenticateToken, UserController.deleteUser);
router.get("/current", authenticateToken, UserController.currentUser);

// Post routes
router.post("/posts", authenticateToken, PostController.createPost);
router.get("/posts", authenticateToken, PostController.getAllPosts);
router.get("/posts/:id", authenticateToken, PostController.getPostById);
router.delete("/posts/:id", authenticateToken, PostController.deletePost);
router.put("/posts/:id", authenticateToken, PostController.updatePost);

// Comment routes
router.post("/comments", authenticateToken, CommentController.createComment);
router.put("/comments/:id", authenticateToken, CommentController.updateComment);
router.delete(
  "/comments/:id",
  authenticateToken,
  CommentController.deleteComment
);

module.exports = router;
