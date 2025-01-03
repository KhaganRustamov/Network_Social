const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const { prisma } = require("../prisma/prisma-client");
const Jdenticon = require("jdenticon");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  deleteRefreshToken,
  deleteAccessToken,
} = require("../utils/auth-token");

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
        return res.status(400).json({ error: "Email or name already exists" });
      }
      if (existingName) {
        return res.status(400).json({ error: "Email or name already exists" });
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
      const activeUser = await prisma.user.findUnique({ where: { email } });
      if (!activeUser) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      // Checking the password
      const valid = await bcrypt.compare(password, activeUser.password);

      if (!valid) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const payload = { userId: activeUser.id };
      const accessToken = generateAccessToken(payload);
      const refreshToken = await generateRefreshToken(payload);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ accessToken });
    } catch (error) {
      console.error("Error in login:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        return res.status(401).json({ error: "Refresh token missing" });
      }

      const payload = await verifyRefreshToken(refreshToken);

      const newAccessToken = generateAccessToken({
        userId: payload.userId,
      });

      res.json({ accessToken: newAccessToken });
    } catch (error) {
      console.error("Error in refreshToken:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  logout: async (req, res) => {
    try {
      const { refreshToken } = req.cookies;

      if (refreshToken) {
        await deleteRefreshToken(refreshToken);
        res.clearCookie("refreshToken", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        res.json({ message: "Logged out successfully" });
      } else {
        res.status(400).json({
          error: "User already logged out or doesn't exists",
        });
      }
    } catch (error) {
      console.error("Error in logout:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = Auth;
