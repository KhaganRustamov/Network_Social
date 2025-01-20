const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const { prisma } = require("../prisma/prisma-client");
const Jdenticon = require("jdenticon");
const cacheKeys = require("../utils/cacheKeys");
const redisClient = require("../utils/redis-client");
// const {
//   generateAccessToken,
//   generateRefreshToken,
//   verifyRefreshToken,
//   deleteRefreshToken,
// } = require("../utils/auth-token");

const Auth = {
  register: async (req, res) => {
    try {
      const { email, password, name } = req.body;
      const userIP = req.ip === "::1" ? "localhost" : req.ip;
      const ipKey = `register:ip:${userIP}`;

      // Checking the fields
      if (!email || !password || !name) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Checking registrations from this IP-address
      let registrationCount = await redisClient.get(ipKey);

      if (registrationCount) {
        registrationCount = parseInt(registrationCount, 10);
      } else {
        registrationCount = 0;
      }

      if (registrationCount >= 3) {
        return res.status(429).json({
          error: "Registration limit reached. Try again later.",
        });
      }

      // Check if a user with such email or name exists
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      const existingName = await prisma.user.findFirst({ where: { name } });

      if (existingEmail || existingName) {
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

      // Delete cache
      await redisClient.del(cacheKeys.USERS_ALL);

      // Increment limit count
      const newCount = await redisClient.incr(ipKey);

      // Reset limit
      if (newCount === 1) {
        await redisClient.set(ipKey, { exp: 3600 });
      }

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

      // Create session for each user
      req.session.userId = activeUser.id;

      // const payload = { userId: activeUser.id };
      // const shortAccessToken = await generateAccessToken(payload, "1m");
      // const refreshToken = await generateRefreshToken(payload);

      // res.cookie("refreshToken", refreshToken, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production",
      //   sameSite: "strict",
      //   maxAge: 7 * 24 * 60 * 60 * 1000,
      // });

      res.json({ message: "Logged in successfully" });
    } catch (error) {
      console.error("Error in login:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // refreshToken: async (req, res) => {
  //   try {
  //     const { refreshToken } = req.cookies;

  //     const userData = await verifyRefreshToken(refreshToken);

  //     const longAccessToken = await generateAccessToken(
  //       {
  //         userId: userData.userId,
  //       },
  //       "7d"
  //     );

  //     res.json({
  //       longAccessToken: longAccessToken,
  //     });
  //   } catch (error) {
  //     console.error("Error in refreshToken:", error);
  //     res.status(403).json({ error: "Invalid or expired refresh token" });
  //   }
  // },

  logout: async (req, res) => {
    try {
      // const { refreshToken } = req.cookies;

      // await deleteRefreshToken(refreshToken);

      // res.clearCookie("refreshToken", {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production",
      //   sameSite: "strict",
      // });

      // Delete session
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to destroy session" });
        }
        res.json({ message: "Logged out successfully" });
      });
    } catch (error) {
      console.error("Error in logout:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = Auth;
