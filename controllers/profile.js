const { prisma } = require("../prisma/prisma-client");
const cacheKeys = require("../utils/cacheKeys");
const redisClient = require("../utils/redis-client");

const Profile = {
  getProfile: async (req, res) => {
    try {
      const userId = req.user.userId;

      //Get profile
      const profile = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          password: false,
          followers: {
            select: {
              follower: {
                include: {
                  password: false,
                },
              },
            },
          },
          following: {
            select: {
              following: {
                include: {
                  password: false,
                },
              },
            },
          },
        },
      });

      res.json(profile);
    } catch (error) {
      console.error("Error in getProfile", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const { email, name, dateOfBirth, bio, location } = req.body;

      let filePath;

      if (req.file && req.file.path) {
        filePath = req.file.path;
      }

      if (!email && !name) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Check if the profile with such email or name exists
      if (email) {
        const existingEmail = await prisma.user.findUnique({
          where: { email },
        });

        if (existingEmail) {
          return res.status(400).json({ error: "Email already exists" });
        }
      }

      if (name) {
        const existingName = await prisma.user.findFirst({
          where: { name },
        });

        if (existingName) {
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
      await redisClient.del(cacheKeys.USERS_ALL);

      res.json(profileUpdate);
    } catch (error) {
      console.error("Error in updateProfile", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteProfile: async (req, res) => {
    try {
      const { id } = req.params;

      // Delete posts
      await prisma.post.deleteMany({
        where: {
          authorId: id,
        },
      });

      // Delete user
      await prisma.user.delete({ where: { id } });

      // Delete session
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to destroy session" });
        }

        res.json({ message: `Profile with id: ${id} deleted successfully` });
      });

      // Delete caches for user and his posts
      await redisClient.del(cacheKeys.POSTS_ALL);
      await redisClient.del(cacheKeys.USERS_ALL);
    } catch (error) {
      console.error("Error in deleteProfile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = Profile;
