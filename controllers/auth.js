const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../prisma/prisma-client");
const Jdenticon = require("jdenticon");

const Auth = {
  register: async (req, res) => {
    try {
      const { email, password, name } = req.body;

      // Checking the fields
      if (!email || !password || !name) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Check if a user with such email or name exists
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      const existingName = await prisma.user.findFirst({ where: { name } });

      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }
      if (existingName) {
        return res.status(400).json({ error: "Name already exists" });
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
    try {
      const { email, password } = req.body;

      // Checking the fields
      if (!email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Find the user
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (!existingUser) {
        return res.status(400).json({ error: "Wrong email or password" });
      }

      // Check the password
      const valid = await bcrypt.compare(password, existingUser.password);

      if (!valid) {
        return res.status(400).json({ error: "Wrong email or password" });
      }

      // Generate a JWT
      const token = jwt.sign(
        { userId: existingUser.id },
        process.env.SECRET_KEY
      );

      res.json({ token });
    } catch (error) {
      console.error("Error in login:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = Auth;
