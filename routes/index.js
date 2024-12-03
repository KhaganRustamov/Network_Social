const express = require("express");
const router = express.Router();
const multer = require("multer");
const UserController = require("../controllers/user-controller");

const uploadDestination = "uploads";

const storage = multer.diskStorage({
  destination: uploadDestination,
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const uploads = multer({ storage: storage });

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/getUserById", UserController.getUserById);
router.post("/updateUser", UserController.updateUser);
router.post("/currentUser", UserController.currentUser);

module.exports = router;
