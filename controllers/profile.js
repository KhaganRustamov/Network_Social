const { prisma } = require("../prisma/prisma-client");
const redisClient = require("../utils/redis-client");
const cacheKeys = require("../utils/cacheKeys");
const { deleteRefreshToken } = require("../utils/auth-token");

const Profile = {
  getProfile: async (req, res) => {
    try {
      const userId = req.user.userId;
      // const cachedProfile = await redisClient.get(cacheKeys.PROFILE(userId));

      // // Check cached profile
      // if (cachedProfile) {
      //   console.log("Returning cached profile");
      //   return res.json(JSON.parse(cachedProfile));
      // }

      //Get profile
      const profile = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          followers: {
            include: {
              follower: true,
            },
          },
          following: {
            include: {
              following: true,
            },
          },
        },
      });

      // Set cache
      // await redisClient.set(
      //   cacheKeys.PROFILE(userId),
      //   JSON.stringify(profile),
      //   {
      //     EX: 3600,
      //   }
      // );

      res.json(profile);
    } catch (error) {
      console.error("Error in getProfile", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { email, name, dateOfBirth, bio, location } = req.body;

      let filePath;

      if (req.file && req.file.path) {
        filePath = req.file.path;
      }

      // Check if the profile with such email or name exists
      if (email) {
        const existingEmail = await prisma.user.findUnique({
          where: { email },
        });

        if (existingEmail && existingEmail.id !== parseInt(id)) {
          return res.status(400).json({ error: "Email already exists" });
        }
      }
      if (name) {
        const existingName = await prisma.user.findFirst({
          where: { name },
        });

        if (existingName && existingName.id !== parseInt(id)) {
          return res.status(400).json({ error: "Name already exists" });
        }
      }

      // Update profile
      const profileUpdate = await prisma.user.update({
        where: { id },
        data: {
          email: email || undefined,
          name: name || undefined,
          avatarUrl: filePath ? `/${filePath}` : undefined,
          dateOfBirth: dateOfBirth || undefined,
          bio: bio || undefined,
          location: location || undefined,
        },
      });

      // Delete cache
      // await redisClient.del(cacheKeys.PROFILE(id));

      res.json(profileUpdate);
    } catch (error) {
      console.error("Error in updateProfile", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const { refreshToken } = req.cookies;

      await prisma.post.deleteMany({
        where: {
          authorId: id,
        },
      });

      await prisma.user.delete({ where: { id } });

      await deleteRefreshToken(refreshToken);

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      // Delete caches
      // await redisClient.del(cacheKeys.POSTS_ALL);
      // await redisClient.del(cacheKeys.PROFILE(id));

      res.json({ message: `Profile with id: ${id} deleted successfully` });
    } catch (error) {
      console.error("Error in deleteProfile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = Profile;
