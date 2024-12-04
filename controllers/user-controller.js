const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../prisma/prisma-client");
const Jdenticon = require("jdenticon");

const UserController = {
  register: async (req, res) => {
    const { email, password, name } = req.body;

    // Checking the fields
    if (!email || !password || !name) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      // Check if a user with such email exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hashing the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate an avatar for a new user
      const png = Jdenticon.toPng(name, 200);
      const avatarName = `${name}_${Date.now()}.png`;
      const avatarPath = path.join(__dirname, "/../uploads", avatarName);
      fs.writeFileSync(avatarPath, png);

      // Create a user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          avatarUrl: `/uploads/${avatarName}`,
        },
      });

      res.json(user);
    } catch (error) {
      console.error("Error in register:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  login: async (req, res) => {
    res.send("OK");
  },
  getUserById: async (req, res) => {
    res.send("OK");
  },
  updateUser: async (req, res) => {
    res.send("OK");
  },
  currentUser: async (req, res) => {
    res.send("OK");
  },
};

module.exports = UserController;
